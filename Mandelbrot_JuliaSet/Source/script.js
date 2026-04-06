const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

// 1. BIẾN ĐIỀU KHIỂN HIỆN TẠI (Dùng để vẽ lên màn hình)
let zoom = 2.5;
let offset = { x: -0.5, y: 0 };
let mode = 0; // 0: Mandelbrot, 1: Julia
let juliaC = { x: -0.7, y: 0.27 }; // Giá trị c mặc định ban đầu

// 2. BỘ NHỚ TRẠNG THÁI (Lưu trữ vị trí "đi săn" của Mandelbrot)
let mandelZoom = 2.5;
let mandelOffset = { x: -0.5, y: 0 };

// 3. BIẾN TƯƠNG TÁC
let isDragging = false;
let lastMouse = { x: 0, y: 0 };

async function init() {
    // Lưu ý: Phải chạy bằng Live Server để nạp được file shader.glsl
    const response = await fetch('shader.glsl');
    const fsSource = await response.text();
    
    const vsSource = `
        attribute vec4 a_position;
        void main() { gl_Position = a_position; }
    `;

    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vsSource); gl.compileShader(vShader);
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fsSource); gl.compileShader(fShader);

    const program = gl.createProgram();
    gl.attachShader(program, vShader); gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Lỗi khởi tạo WebGL Program");
        return;
    }

    const locs = {
        res: gl.getUniformLocation(program, "u_resolution"),
        zoom: gl.getUniformLocation(program, "u_zoom"),
        off: gl.getUniformLocation(program, "u_offset"),
        mode: gl.getUniformLocation(program, "u_mode"),
        jC: gl.getUniformLocation(program, "u_julia_c"),
    };

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    function render() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(program);
        gl.uniform2f(locs.res, canvas.width, canvas.height);
        gl.uniform1f(locs.zoom, zoom);
        gl.uniform2f(locs.off, offset.x, offset.y);
        gl.uniform1i(locs.mode, mode);
        gl.uniform2f(locs.jC, juliaC.x, juliaC.y);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    render();
}

// --- XỬ LÝ TƯƠNG TÁC CHUỘT ---

window.addEventListener("wheel", e => {
    const s = e.deltaY > 0 ? 1.1 : 0.9;
    zoom *= s;
    
    // Lưu trạng thái zoom nếu đang ở Mandelbrot
    if (mode === 0) { mandelZoom = zoom; }
});

window.addEventListener("mousedown", e => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mouseup", () => isDragging = false);

window.addEventListener("mousemove", e => {
    const aspect = canvas.width / canvas.height;
    
    // 1. Tính toán tọa độ thực tế của con trỏ chuột trên mặt phẳng phức
    const mouseX = (e.clientX / canvas.width) * 2 - 1;
    const mouseY = (e.clientY / canvas.height) * -2 + 1;
    const currentComplexX = (mouseX * aspect) * zoom + offset.x;
    const currentComplexY = mouseY * zoom + offset.y;
    
    // 2. Nếu đang ở mode Mandelbrot, cập nhật c cho Julia dựa trên vị trí chuột
    if (mode === 0) {
        juliaC.x = currentComplexX;
        juliaC.y = currentComplexY;
    }

    // 3. Xử lý kéo (Panning)
    if (isDragging) {
        const dx = (e.clientX - lastMouse.x) / canvas.width * zoom * aspect * 2.0;
        const dy = (e.clientY - lastMouse.y) / canvas.height * zoom * 2.0;
        
        offset.x -= dx;
        offset.y += dy;
        lastMouse = { x: e.clientX, y: e.clientY };
        
        // Lưu trạng thái offset nếu đang ở Mandelbrot
        if (mode === 0) {
            mandelOffset.x = offset.x;
            mandelOffset.y = offset.y;
        }
    }
});

// --- XỬ LÝ PHÍM BẤM ĐIỀU KHIỂN ---

window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    
    if (key === 'm') { 
        mode = 0; 
        // Khôi phục lại chính xác vị trí "đang thám hiểm" của Mandelbrot
        zoom = mandelZoom;
        offset = { x: mandelOffset.x, y: mandelOffset.y };
        document.getElementById("modeName").innerText = "Mandelbrot";
    }
    
    if (key === 'j') { 
        mode = 1; 
        // Luôn Reset Julia về góc nhìn toàn cảnh (0,0) để dễ quan sát đối xứng
        zoom = 3.0; 
        offset = { x: 0, y: 0 }; 
        document.getElementById("modeName").innerText = "Julia Set";
    }

    // Phím [R] để đặt lại toàn bộ về mặc định ban đầu
    if (key === 'r') {
        if (mode === 0) {
            zoom = mandelZoom = 2.5;
            offset = mandelOffset = { x: -0.5, y: 0 };
        } else {
            zoom = 3.0;
            offset = { x: 0, y: 0 };
        }
    }
});

// Khởi tạo ứng dụng
init();
