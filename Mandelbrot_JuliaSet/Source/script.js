const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

// Biến điều khiển
let zoom = 2.5;
let offset = { x: -0.5, y: 0 }; // Mandelbrot mặc định lệch sang trái một chút
let mode = 0; 
let juliaC = { x: -0.4, y: 0.6 }; 
let isDragging = false;
let lastMouse = { x: 0, y: 0 };

async function init() {
    // LƯU Ý: Phải chạy bằng Live Server để fetch được file shader
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

    // Lấy vị trí các biến Uniform
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

// Xử lý tương tác
window.addEventListener("wheel", e => {
    const s = e.deltaY > 0 ? 1.1 : 0.9;
    zoom *= s;
});

window.addEventListener("mousemove", e => {
    // Chuyển tọa độ chuột sang số phức để cập nhật c cho Julia [cite: 87]
    const aspect = canvas.width / canvas.height;
    const mouseX = (e.clientX / canvas.width) * 2 - 1;
    const mouseY = (e.clientY / canvas.height) * -2 + 1;
    
    // Nếu đang ở Mandelbrot, cập nhật c cho Julia dựa trên vị trí chuột [cite: 59, 62]
    if (mode === 0) {
        juliaC.x = (mouseX * aspect) * zoom + offset.x;
        juliaC.y = mouseY * zoom + offset.y;
    }

    if (isDragging) {
        offset.x -= (e.clientX - lastMouse.x) / canvas.width * zoom * aspect * 2.0;
        offset.y += (e.clientY - lastMouse.y) / canvas.height * zoom * 2.0;
        lastMouse = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener("mousedown", e => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; });
window.addEventListener("mouseup", () => isDragging = false);

window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    if (key === 'm') { 
        mode = 0; 
        zoom = 2.5; 
        offset = { x: -0.5, y: 0 }; 
        document.getElementById("modeName").innerText = "Mandelbrot";
    }
    if (key === 'j') { 
        mode = 1; 
        zoom = 3.0; 
        offset = { x: 0, y: 0 }; // Julia nên bắt đầu ở tâm (0,0) 
        document.getElementById("modeName").innerText = "Julia Set";
    }
});

init();