// ==================== VERTEX SHADER ====================
// Shader chay tren GPU, xu ly tung dinh (vertex)
export const vertexShaderSource = `
    attribute vec2 a_position;   // Toa do (x, y) cua dinh
    attribute vec3 a_color;      // Mau (r, g, b) cua dinh
    varying vec3 v_color;        // Truyen mau sang Fragment Shader

    void main() {
        // Chuyen toa do 2D thanh 4D (x, y, z=0, w=1) cho WebGL
        gl_Position = vec4(a_position, 0.0, 1.0);
        // Truyen mau xuong Fragment Shader
        v_color = a_color;
    }
`;

// ==================== FRAGMENT SHADER ====================
// Shader xu ly tung pixel (fragment), quyet dinh mau sac
export const fragmentShaderSource = `
    precision mediump float;     // Do chinh xac trung binh cho so thuc
    varying vec3 v_color;        // Nhan mau tu Vertex Shader (da noi suy)

    void main() {
        // Xuat mau RGBA (alpha = 1.0 = khong trong suot)
        gl_FragColor = vec4(v_color, 1.0);
    }
`;
