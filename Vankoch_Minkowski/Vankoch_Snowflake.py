import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import FancyArrowPatch


def koch_points(p1, p2, level):
    """Trả về danh sách điểm của đường cong Koch giữa p1 và p2."""
    if level == 0:
        return [p1, p2]

    dx, dy = p2[0] - p1[0], p2[1] - p1[1]

    a = (p1[0] + dx / 3,       p1[1] + dy / 3)
    b = (p1[0] + 2 * dx / 3,   p1[1] + 2 * dy / 3)

    # Đỉnh nhọn — xoay đoạn ab -60° (chiều kim đồng hồ) để gai mọc RA NGOÀI
    angle = -np.pi / 3  # Đổi dấu để gai mọc ra ngoài thay vì vào trong
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    ex, ey = b[0] - a[0], b[1] - a[1]
    peak = (
        a[0] + ex * np.cos(angle) - ey * np.sin(angle),
        a[1] + ex * np.sin(angle) + ey * np.cos(angle),
    )

    s1 = koch_points(p1,   a,    level - 1)
    s2 = koch_points(a,    peak, level - 1)
    s3 = koch_points(peak, b,    level - 1)
    s4 = koch_points(b,    p2,   level - 1)

    return s1[:-1] + s2[:-1] + s3[:-1] + s4


def snowflake_coords(level, cx=0.0, cy=0.0, r=1.0):
    """Tọa độ toàn bộ bông tuyết Koch ở cấp độ cho trước."""
    angle_offset = np.pi / 2
    vertices = [
        (cx + r * np.cos(angle_offset + i * 2 * np.pi / 3),
         cy + r * np.sin(angle_offset + i * 2 * np.pi / 3))
        for i in range(3)
    ]

    pts = []
    for i in range(3):
        seg = koch_points(vertices[i], vertices[(i + 1) % 3], level)
        pts.extend(seg[:-1])

    pts.append(pts[0])       
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return np.array(xs), np.array(ys)


def interpolate_coords(xs_from, ys_from, xs_to, ys_to, t):
    """
    Nội suy tuyến tính giữa hai tập tọa độ.
    Nếu độ phân giải khác nhau, up-sample tập ngắn hơn.
    """
    def upsample(xs, ys, n):
        idx = np.linspace(0, len(xs) - 1, n)
        return np.interp(idx, np.arange(len(xs)), xs), \
               np.interp(idx, np.arange(len(ys)), ys)

    n = max(len(xs_from), len(xs_to))
    if len(xs_from) < n:
        xs_from, ys_from = upsample(xs_from, ys_from, n)
    if len(xs_to) < n:
        xs_to, ys_to = upsample(xs_to, ys_to, n)

    ease = t * t * (3 - 2 * t)   
    return xs_from + (xs_to - xs_from) * ease, \
           ys_from + (ys_to - ys_from) * ease


# ── Màu sắc cho từng cấp độ ──────────────────────────────
LEVEL_COLORS = [
    ("#4a90d9", "#d0e8ff"),   # 0 — xanh dương
    ("#7c5cbf", "#e8d8ff"),   # 1 — tím
    ("#2aab85", "#c8f0e8"),   # 2 — xanh lá
    ("#d9884a", "#ffe8cc"),   # 3 — cam
    ("#4a9fd9", "#cce8ff"),   # 4 — xanh nhạt
    ("#d94a7c", "#ffd0e8"),   # 5 — hồng
]

LEVEL_TITLES = [
    "Cấp 0 — Tam giác đều",
    "Cấp 1 — Ngôi sao 6 cánh",
    "Cấp 2 — 18 gai nhỏ",
    "Cấp 3 — 54 gai mịn",
    "Cấp 4 — Bông tuyết Koch",
    "Cấp 5 — Siêu chi tiết",
]

LEVEL_NOTES = [
    "Điểm khởi đầu: 3 cạnh — 3 đỉnh",
    "Mỗi cạnh mọc 1 mũi nhọn → 12 cạnh",
    "Tiếp tục nhân gai lên → 48 cạnh",
    "Fractal đang hình thành → 192 cạnh",
    "Hình dạng bông tuyết rõ ràng → 768 cạnh",
    "Tự tương đồng ở mọi tỉ lệ → 3072 cạnh",
]

MAX_LEVEL      = 5
FRAMES_PER_STEP = 40     # số frame cho mỗi lần chuyển cấp
PAUSE_FRAMES    = 20     # dừng lại khi đến cấp mới
TOTAL_LEVELS    = MAX_LEVEL + 1


def animate_snowflake_evolution():
    """Hoạt ảnh Koch snowflake từ cấp 0 → cấp 5."""

    # Tính trước tọa độ tất cả các cấp
    all_xs, all_ys = zip(*[snowflake_coords(l) for l in range(TOTAL_LEVELS)])

    fig, ax = plt.subplots(figsize=(7, 7), facecolor="#0d0d1a")
    ax.set_facecolor("#0d0d1a")
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-1.3, 1.3)

    # Đường viền chính
    line_fill,  = ax.fill([], [], zorder=2)
    line_edge,  = ax.plot([], [], lw=1.4, zorder=3)

    # Bóng mờ các cấp trước
    ghost_fills  = [ax.fill([], [], zorder=1)[0] for _ in range(TOTAL_LEVELS)]
    ghost_edges  = [ax.plot([], [], lw=0.5, zorder=1)[0] for _ in range(TOTAL_LEVELS)]

    title_txt = ax.text(
        0, 1.22, "", ha="center", va="top",
        fontsize=14, fontweight="bold", color="white"
    )
    note_txt = ax.text(
        0, -1.20, "", ha="center", va="bottom",
        fontsize=10, color="#aabbcc"
    )
    level_txt = ax.text(
        -1.25, 1.22, "", ha="left", va="top",
        fontsize=9, color="#556677"
    )

    total_frames = TOTAL_LEVELS * (FRAMES_PER_STEP + PAUSE_FRAMES)

    def update(frame):
        # Xác định đang ở giai đoạn chuyển tiếp hay dừng
        step_len = FRAMES_PER_STEP + PAUSE_FRAMES
        step     = frame // step_len
        local    = frame % step_len

        step = min(step, MAX_LEVEL)

        if local < FRAMES_PER_STEP and step > 0:
            # Đang chuyển tiếp từ (step-1) → step
            t  = local / FRAMES_PER_STEP
            xs, ys = interpolate_coords(
                all_xs[step - 1], all_ys[step - 1],
                all_xs[step],     all_ys[step],
                t,
            )
            cur_level = step
        else:
            # Đang dừng ở cấp hiện tại
            xs, ys    = all_xs[step], all_ys[step]
            cur_level = step

        stroke, fill = LEVEL_COLORS[cur_level]

        line_fill.set_xy(np.column_stack([xs, ys]))
        line_fill.set_facecolor(fill + "40")   # alpha hex
        line_fill.set_edgecolor("none")

        line_edge.set_data(xs, ys)
        line_edge.set_color(stroke)

        # Vẽ bóng mờ các cấp trước
        for l in range(TOTAL_LEVELS):
            visible = l < cur_level
            ghost_fills[l].set_visible(visible)
            ghost_edges[l].set_visible(visible)
            if visible:
                gs, gf = LEVEL_COLORS[l]
                ghost_fills[l].set_xy(np.column_stack([all_xs[l], all_ys[l]]))
                ghost_fills[l].set_facecolor("none")
                ghost_fills[l].set_edgecolor("none")
                ghost_edges[l].set_data(all_xs[l], all_ys[l])
                ghost_edges[l].set_color(gs + "18")

        title_txt.set_text(LEVEL_TITLES[cur_level])
        note_txt.set_text(LEVEL_NOTES[cur_level])
        level_txt.set_text(f"Cấp {cur_level} / {MAX_LEVEL}")

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
    animate_snowflake_evolution()