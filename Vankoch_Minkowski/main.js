// ============================================================================
// 1. CÁC THUẬT TOÁN FRACTAL CỐT LÕI
// ============================================================================

function kochPoints(p1, p2, level) {
    if (level === 0) return [p1, p2];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const a = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
    const b = { x: p1.x + 2 * dx / 3, y: p1.y + 2 * dy / 3 };

    const angle = -Math.PI / 3;
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const peak = {
        x: a.x + ex * Math.cos(angle) - ey * Math.sin(angle),
        y: a.y + ex * Math.sin(angle) + ey * Math.cos(angle)
    };

    const s1 = kochPoints(p1, a, level - 1);
    const s2 = kochPoints(a, peak, level - 1);
    const s3 = kochPoints(peak, b, level - 1);
    const s4 = kochPoints(b, p2, level - 1);

    return [...s1.slice(0, -1), ...s2.slice(0, -1), ...s3.slice(0, -1), ...s4];
}

function getKochCoords(level, cx = 0.0, cy = 0.0, r = 1.0) {
    const angleOffset = Math.PI / 2;
    const vertices = [];
    for (let i = 0; i < 3; i++) {
        vertices.push({
            x: cx + r * Math.cos(angleOffset + i * 2 * Math.PI / 3),
            y: cy + r * Math.sin(angleOffset + i * 2 * Math.PI / 3)
        });
    }

    let pts = [];
    for (let i = 0; i < 3; i++) {
        const seg = kochPoints(vertices[i], vertices[(i + 1) % 3], level);
        pts.push(...seg.slice(0, -1));
    }
    pts.push(pts[0]);
    return pts;
}

function minkowskiPoints(p1, p2, level) {
    if (level === 0) return [p1, p2];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const fx = dx / 4, fy = dy / 4;
    const ox = dy / 4, oy = -dx / 4;

    let cur = { x: p1.x, y: p1.y };
    const pts = [cur];
    
    const moves = [
        [fx, fy], [ox, oy], [fx, fy], [-ox, -oy],
        [-ox, -oy], [fx, fy], [ox, oy], [fx, fy]
    ];

    for (const m of moves) {
        cur = { x: cur.x + m[0], y: cur.y + m[1] };
        pts.push(cur);
    }

    const result = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const seg = minkowskiPoints(pts[i], pts[i + 1], level - 1);
        result.push(...seg.slice(0, -1));
    }
    result.push(pts[pts.length - 1]);
    return result;
}

function getMinkowskiCoords(level, cx = 0.0, cy = 0.0, r = 1.0) {
    const h = r / Math.sqrt(2);
    const vertices = [
        { x: cx + h, y: cy - h },
        { x: cx + h, y: cy + h },
        { x: cx - h, y: cy + h },
        { x: cx - h, y: cy - h },
    ];

    let pts = [];
    for (let i = 0; i < 4; i++) {
        const seg = minkowskiPoints(vertices[i], vertices[(i + 1) % 4], level);
        pts.push(...seg.slice(0, -1));
    }
    pts.push(pts[0]);
    return pts;
}

// ============================================================================
// 2. NỘI SUY (INTERPOLATION)
// ============================================================================

function upsample(arr, n) {
    const res = [];
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const idx = t * (arr.length - 1);
        const left = Math.floor(idx);
        const right = Math.ceil(idx);
        if (left === right) {
            res.push({ x: arr[left].x, y: arr[left].y });
        } else {
            const frac = idx - left;
            res.push({
                x: arr[left].x + (arr[right].x - arr[left].x) * frac,
                y: arr[left].y + (arr[right].y - arr[left].y) * frac
            });
        }
    }
    return res;
}

function interpolateCoords(arrFrom, arrTo, t) {
    const n = Math.max(arrFrom.length, arrTo.length);
    let aFrom = arrFrom.length < n ? upsample(arrFrom, n) : arrFrom;
    let aTo = arrTo.length < n ? upsample(arrTo, n) : arrTo;

    const ease = t * t * (3 - 2 * t);
    const res = [];
    for (let i = 0; i < n; i++) {
        res.push({
            x: aFrom[i].x + (aTo[i].x - aFrom[i].x) * ease,
            y: aFrom[i].y + (aTo[i].y - aFrom[i].y) * ease
        });
    }
    return res;
}

// ============================================================================
// 3. CẤU HÌNH & TRẠNG THÁI
// ============================================================================

const CONFIG = {
    koch: {
        maxLevel: 5, scale: 0.7,
        colors: ["#4a90d9", "#7c5cbf", "#2aab85", "#d9884a", "#4a9fd9", "#d94a7c"],
        titles: [
            "Cấp 0 — Tam giác đều", "Cấp 1 — Ngôi sao 6 cánh", "Cấp 2 — 18 gai nhỏ",
            "Cấp 3 — 54 gai mịn", "Cấp 4 — Bông tuyết Koch", "Cấp 5 — Siêu chi tiết"
        ],
        notes: [
            "Điểm khởi đầu: 3 cạnh — 3 đỉnh", "Mỗi cạnh mọc 1 mũi nhọn → 12 cạnh",
            "Tiếp tục nhân gai lên → 48 cạnh", "Fractal đang hình thành → 192 cạnh",
            "Hình dạng bông tuyết rõ ràng → 768 cạnh", "Tự tương đồng ở mọi tỉ lệ → 3072 cạnh"
        ],
        generator: getKochCoords
    },
    minkowski: {
        maxLevel: 4, scale: 0.7,
        colors: ["#4a90d9", "#7c5cbf", "#2aab85", "#d9884a", "#d94a7c"],
        titles: [
            "Cấp 0 — Hình vuông", "Cấp 1 — Gai bậc 1", "Cấp 2 — Gai bậc 2",
            "Cấp 3 — Gai bậc 3", "Cấp 4 — Đảo Minkowski"
        ],
        notes: [
            "Điểm khởi đầu: 4 cạnh — 4 đỉnh vuông", "Mỗi cạnh → 8 đoạn nhỏ: mọc gai ra ngoài & vào trong",
            "Mỗi đoạn lại tách 8 — fractal bắt đầu hiện rõ", "Tiếp tục nhân 8 — đường viền ngày càng phức tạp",
            "Đảo Minkowski hoàn chỉnh · chiều dài đường viền → ∞"
        ],
        generator: getMinkowskiCoords
    }
};

let currentData = [];
let currentConfig = null;
let frameCount = 0;
let animationId = null;
const FRAMES_PER_STEP = 50;
const PAUSE_FRAMES = 30;

function precalculateData(type) {
    currentConfig = CONFIG[type];
    currentData = [];
    for (let l = 0; l <= currentConfig.maxLevel; l++) {
        currentData.push(currentConfig.generator(l));
    }
}

function hexToRgb(hex) {
    let bigint = parseInt(hex.replace('#', ''), 16);
    return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
}

// ============================================================================
// 4. KHỞI TẠO WEBGL VÀ CHẠY
// ============================================================================

async function initWebGL() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl"); // Đưa dòng này lên trước

    if (!gl) {
        alert("Trình duyệt của bạn không hỗ trợ WebGL.");
        return;
    }

    // Đặt cụm resize ở đây, khi 'gl' đã tồn tại
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Gọi lần đầu để set kích thước chuẩn

    try {
        // Fetch dữ liệu từ 2 file shader
        const vsResponse = await fetch('vertex.glsl');
        const fsResponse = await fetch('fragment.glsl');
        const vsSource = await vsResponse.text();
        const fsSource = await fsResponse.text();

        function compileShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getUniformLocation(program, "u_color");
        const scaleLocation = gl.getUniformLocation(program, "u_scale");

        function drawPoints(pts, colorHex) {
            const flatArray = new Float32Array(pts.length * 2);
            for (let i = 0; i < pts.length; i++) {
                flatArray[i * 2] = pts[i].x;
                flatArray[i * 2 + 1] = pts[i].y;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatArray, gl.DYNAMIC_DRAW);
            
            const rgb = hexToRgb(colorHex);
            gl.uniform4f(colorLocation, rgb[0], rgb[1], rgb[2], 1.0);
            
            // --- XỬ LÝ TỈ LỆ KHUNG HÌNH ĐỂ KHÔNG BỊ MÉO ---
            const aspect = canvas.width / canvas.height;
            let scaleX = currentConfig.scale;
            let scaleY = currentConfig.scale;

            if (aspect > 1.0) {
                // Màn hình ngang: Thu nhỏ theo trục X
                scaleX /= aspect;
            } else {
                // Màn hình dọc: Thu nhỏ theo trục Y
                scaleY *= aspect;
            }
            
            // Truyền 2 giá trị scaleX và scaleY vào shader
            gl.uniform2f(scaleLocation, scaleX, scaleY);
            // ----------------------------------------------

            gl.drawArrays(gl.LINE_STRIP, 0, pts.length);
        }

        function renderLoop() {
            const stepLen = FRAMES_PER_STEP + PAUSE_FRAMES;
            let step = Math.min(Math.floor(frameCount / stepLen), currentConfig.maxLevel);
            let localFrame = frameCount % stepLen;
            
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // Tôi đổi nền thành đen tuyền cho hợp giao diện Hacker
            gl.clear(gl.COLOR_BUFFER_BIT);

            let activePts = [];
            
            if (localFrame < FRAMES_PER_STEP && step > 0) {
                let t = localFrame / FRAMES_PER_STEP;
                activePts = interpolateCoords(currentData[step - 1], currentData[step], t);
            } else {
                activePts = currentData[step];
            }

            document.getElementById("levelTitle").innerText = currentConfig.titles[step];
            document.getElementById("levelNote").innerText = currentConfig.notes[step];

            drawPoints(activePts, currentConfig.colors[step]);

            frameCount++;
            const totalFrames = (currentConfig.maxLevel + 1) * stepLen;
            if (frameCount < totalFrames) {
                animationId = requestAnimationFrame(renderLoop);
            }
        }

        function startAnimation() {
            if (animationId) cancelAnimationFrame(animationId);
            const type = document.getElementById("fractalType").value;
            precalculateData(type);
            frameCount = 0;
            renderLoop();
        }

        // Bắt sự kiện người dùng
        document.getElementById("fractalType").addEventListener("change", startAnimation);
        document.getElementById("restartBtn").addEventListener("click", startAnimation);

        // Chạy lần đầu
        startAnimation();

    } catch (error) {
        console.error("Lỗi tải file Shader. Bạn đã bật Local Server chưa?", error);
        document.getElementById("levelTitle").innerText = "Lỗi tải Shader (Xem Console)";
    }
}

// Kích hoạt quá trình khởi tạo khi trang load xong
initWebGL();