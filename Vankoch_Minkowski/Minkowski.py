import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation


# ─────────────────────────────────────────────────────────
#  CORE — Đường cong Minkowski
# ─────────────────────────────────────────────────────────

def minkowski_points(p1, p2, level):
    """
    Trả về danh sách điểm của đường cong Minkowski giữa p1 và p2.

    Quy tắc thay thế (8 đoạn, mỗi đoạn = 1/4 độ dài gốc):
      tiến, ra-ngoài, tiến, vào-trong, vào-trong, tiến, ra-ngoài, tiến
    Tổng dịch chuyển ngang = 4 × 1/4 = 1 (đúng)
    Tổng dịch chuyển dọc   = +1 -1 -1 +1 = 0 (đúng)
    """
    if level == 0:
        return [p1, p2]

    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    fx, fy =  dx / 4,  dy / 4   # tiến 1/4
    ox, oy =  dy / 4, -dx / 4   # vuông góc ra ngoài (phải của hướng đi CCW)

    cur = list(p1)
    pts = [p1]
    for mx, my in [
        ( fx,  fy),   # tiến
        ( ox,  oy),   # ra ngoài
        ( fx,  fy),   # tiến
        (-ox, -oy),   # vào trong
        (-ox, -oy),   # vào trong
        ( fx,  fy),   # tiến
        ( ox,  oy),   # ra ngoài
        ( fx,  fy),   # tiến
    ]:
        cur = [cur[0] + mx, cur[1] + my]
        pts.append(tuple(cur))

    result = []
    for i in range(len(pts) - 1):
        seg = minkowski_points(pts[i], pts[i + 1], level - 1)
        result.extend(seg[:-1])
    result.append(pts[-1])
    return result


def island_coords(level, cx=0.0, cy=0.0, r=1.0):
    """
    Tọa độ toàn bộ đảo Minkowski ở cấp độ cho trước.
    Hình nền: hình vuông (cạnh = r√2), đi CCW để gai mọc ra ngoài.
    """
    h = r / np.sqrt(2)
    vertices = [
        (cx + h, cy - h),   # dưới-phải
        (cx + h, cy + h),   # trên-phải
        (cx - h, cy + h),   # trên-trái
        (cx - h, cy - h),   # dưới-trái
    ]

    pts = []
    for i in range(4):
        seg = minkowski_points(vertices[i], vertices[(i + 1) % 4], level)
        pts.extend(seg[:-1])
    pts.append(pts[0])

    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return np.array(xs), np.array(ys)


# ─────────────────────────────────────────────────────────
#  ANIMATION
# ─────────────────────────────────────────────────────────

def interpolate_coords(xs_from, ys_from, xs_to, ys_to, t):
    """Nội suy smoothstep giữa hai tập tọa độ (up-sample nếu cần)."""
    def upsample(xs, ys, n):
        idx = np.linspace(0, len(xs) - 1, n)
        return (np.interp(idx, np.arange(len(xs)), xs),
                np.interp(idx, np.arange(len(ys)), ys))

    n = max(len(xs_from), len(xs_to))
    if len(xs_from) < n:
        xs_from, ys_from = upsample(xs_from, ys_from, n)
    if len(xs_to) < n:
        xs_to, ys_to = upsample(xs_to, ys_to, n)

    ease = t * t * (3 - 2 * t)   # smoothstep
    return (xs_from + (xs_to - xs_from) * ease,
            ys_from + (ys_to - ys_from) * ease)


LEVEL_COLORS = [
    ("#4a90d9", "#d0e8ff"),   # 0 — xanh dương
    ("#7c5cbf", "#e8d8ff"),   # 1 — tím
    ("#2aab85", "#c8f0e8"),   # 2 — xanh lá
    ("#d9884a", "#ffe8cc"),   # 3 — cam
    ("#d94a7c", "#ffd0e8"),   # 4 — hồng
]

LEVEL_TITLES = [
    "Cấp 0 — Hình vuông",
    "Cấp 1 — Gai bậc 1 (32 đoạn)",
    "Cấp 2 — Gai bậc 2 (256 đoạn)",
    "Cấp 3 — Gai bậc 3 (2 048 đoạn)",
    "Cấp 4 — Đảo Minkowski (16 384 đoạn)",
]

LEVEL_NOTES = [
    "Điểm khởi đầu: 4 cạnh — 4 đỉnh vuông",
    "Mỗi cạnh → 8 đoạn nhỏ (1/4 độ dài): mọc gai ra ngoài & dents vào trong",
    "Mỗi đoạn lại tách 8 — fractal bắt đầu hiện rõ",
    "Tiếp tục nhân 8 — đường viền ngày càng phức tạp",
    "Đảo Minkowski hoàn chỉnh · chiều dài đường viền → ∞",
]

MAX_LEVEL       = 4
FRAMES_PER_STEP = 50
PAUSE_FRAMES    = 25
TOTAL_LEVELS    = MAX_LEVEL + 1


def animate_minkowski_evolution():
    """Hoạt ảnh đảo Minkowski từ cấp 0 (hình vuông) → cấp 4."""

    print("Đang tính toán tọa độ các cấp (vài giây)…")
    all_xs, all_ys = zip(*[island_coords(l) for l in range(TOTAL_LEVELS)])
    print("Xong — bắt đầu hoạt ảnh.")

    fig, ax = plt.subplots(figsize=(7, 7), facecolor="#0d0d1a")
    ax.set_facecolor("#0d0d1a")
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_xlim(-1.4, 1.4)
    ax.set_ylim(-1.4, 1.4)

    line_fill, = ax.fill([], [], zorder=2)
    line_edge, = ax.plot([], [], lw=1.4, zorder=3)

    ghost_fills = [ax.fill([], [], zorder=1)[0] for _ in range(TOTAL_LEVELS)]
    ghost_edges = [ax.plot([], [], lw=0.5,  zorder=1)[0] for _ in range(TOTAL_LEVELS)]

    title_txt = ax.text(0,  1.33, "", ha="center", va="top",
                        fontsize=14, fontweight="bold", color="white")
    note_txt  = ax.text(0, -1.30, "", ha="center", va="bottom",
                        fontsize=10, color="#aabbcc")
    level_txt = ax.text(-1.35, 1.33, "", ha="left", va="top",
                        fontsize=9, color="#556677")

    total_frames = TOTAL_LEVELS * (FRAMES_PER_STEP + PAUSE_FRAMES)

    def update(frame):
        step_len = FRAMES_PER_STEP + PAUSE_FRAMES
        step  = min(frame // step_len, MAX_LEVEL)
        local = frame % step_len

        if local < FRAMES_PER_STEP and step > 0:
            t = local / FRAMES_PER_STEP
            xs, ys = interpolate_coords(
                all_xs[step - 1], all_ys[step - 1],
                all_xs[step],     all_ys[step], t)
            cur = step
        else:
            xs, ys = all_xs[step], all_ys[step]
            cur = step

        stroke, fill = LEVEL_COLORS[cur]
        line_fill.set_xy(np.column_stack([xs, ys]))
        line_fill.set_facecolor(fill + "40")
        line_fill.set_edgecolor("none")
        line_edge.set_data(xs, ys)
        line_edge.set_color(stroke)

        for l in range(TOTAL_LEVELS):
            vis = l < cur
            ghost_fills[l].set_visible(vis)
            ghost_edges[l].set_visible(vis)
            if vis:
                gs, _ = LEVEL_COLORS[l]
                ghost_fills[l].set_xy(np.column_stack([all_xs[l], all_ys[l]]))
                ghost_fills[l].set_facecolor("none")
                ghost_fills[l].set_edgecolor("none")
                ghost_edges[l].set_data(all_xs[l], all_ys[l])
                ghost_edges[l].set_color(gs + "18")

        title_txt.set_text(LEVEL_TITLES[cur])
        note_txt.set_text(LEVEL_NOTES[cur])
        level_txt.set_text(f"Cấp {cur} / {MAX_LEVEL}")

        return (line_fill, line_edge, title_txt, note_txt, level_txt,
                *ghost_fills, *ghost_edges)

    ani = animation.FuncAnimation(
        fig, update,
        frames=total_frames,
        interval=30,
        blit=True,
    )

    plt.tight_layout()
    plt.show()


# ─────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    animate_minkowski_evolution()