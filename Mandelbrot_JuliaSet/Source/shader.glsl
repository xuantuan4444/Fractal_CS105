precision highp float;
uniform vec2 u_resolution;
uniform float u_zoom;
uniform vec2 u_offset;
uniform int u_mode; // 0: Mandelbrot, 1: Julia
uniform vec2 u_julia_c;

// --- HÀM TÔ MÀU PHONG CÁCH "NEON BLUE" (Tái tạo theo hình ảnh của bạn) ---
// Hàm này nhận vào giá trị 't' (tốc độ phân kỳ, từ 0.0 đến 1.0)
vec3 getGlowColor(float t) {
    if (t <= 0.0) return vec3(0.0); // Nếu không phân kỳ -> màu đen

    // Định nghĩa các dải màu (Palette Stops) dựa trên hình ảnh
    vec3 deepBlue = vec3(0.0, 0.0, 0.2);     // Xanh dương cực đậm (nền xa)
    vec3 vibrantBlue = vec3(0.0, 0.1, 0.6);   // Xanh dương sáng (nhánh ngoài)
    vec3 brightCyan = vec3(0.0, 0.9, 1.0);    // Xanh Cyan (biên fractal, nhánh chính)
    vec3 brightYellow = vec3(1.0, 1.0, 0.8);  // Vàng nhạt/Trắng (lõi của các xoắn ốc)

    // Nội suy màu sắc mượt mà qua các dải
    vec3 color;
    if (t < 0.15) {
        color = mix(deepBlue, vibrantBlue, t / 0.15);
    } else if (t < 0.5) {
        color = mix(vibrantBlue, brightCyan, (t - 0.15) / 0.35);
    } else {
        // Phần lõi phát sáng (Cyan -> Vàng/Trắng)
        color = mix(brightCyan, brightYellow, (t - 0.5) / 0.5);
    }
    
    // Thêm một chút hiệu ứng "Glow" bằng cách tăng độ sáng tổng thể cho các vùng gần biên
    float glow = pow(t, 0.6); // Hiệu chỉnh Gamma để vùng sáng rộng hơn một chút
    return color * glow * 1.5; // Tăng cường độ sáng 1.5 lần
}

void main() {
    // 1. Ánh xạ tọa độ pixel sang mặt phẳng phức (giữ nguyên aspect ratio)
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    vec2 c, z;

    if (u_mode == 0) {
        c = uv * u_zoom + u_offset; // Mandelbrot
        z = vec2(0.0);
    } else {
        c = u_julia_c;             // Julia
        z = uv * u_zoom + u_offset;
    }

    float iter = 0.0;
    const float max_iter = 300.0; // Tăng max_iter để màu sắc chi tiết hơn ở vùng biên

    // 2. Vòng lặp Escape Time (giữ nguyên logic toán học)
    for (float i = 0.0; i < max_iter; i++) {
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (2.0 * z.x * z.y) + c.y;
        z = vec2(x, y);

        if (length(z) > 2.0) break;
        iter++;
    }

    // 3. Kỹ thuật Smooth Coloring (Nâng cao - Giữ nguyên)
    if (iter < max_iter) {
        float log_zn = log(z.x * z.x + z.y * z.y) / 2.0;
        float nu = log(log_zn / log(2.0)) / log(2.0);
        iter = iter + 1.0 - nu; // Công thức nội suy
    }

    // 4. Áp dụng bảng màu Neon Blue mới
    float t = iter / max_iter;
    
    // Nếu điểm thuộc tập hợp (không phân kỳ) -> màu đen (lõi Fractal)
    vec3 rgb = (iter >= max_iter) ? vec3(0.0) : getGlowColor(t);
    
    gl_FragColor = vec4(rgb, 1.0);
}