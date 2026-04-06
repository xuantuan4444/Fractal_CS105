// ============================================================================
// MANDELBROT & JULIA FRACTAL
// ============================================================================

export async function initMandelbrotJulia(canvasId, modeNameId, getSectionFn) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl');
    
    let zoom = 2.5, offset = { x: -0.5, y: 0 }, mode = 0, juliaC = { x: -0.7, y: 0.27 };
    let mandelZoom = 2.5, mandelOffset = { x: -0.5, y: 0 };
    let isDragging = false, lastMouse = { x: 0, y: 0 };
    
    // Load shader from file
    const shaderSource = await fetch('shaders/mandelbrot-julia.glsl').then(r => r.text());
    const shaderParts = shaderSource.split('// FRAGMENT SHADER');
    const vsSource = shaderParts[0].replace('// VERTEX SHADER', '').trim();
    const fsSource = shaderParts[1].trim();
    
    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }
    
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    
    const locs = {
        res: gl.getUniformLocation(program, 'u_resolution'),
        zoom: gl.getUniformLocation(program, 'u_zoom'),
        off: gl.getUniformLocation(program, 'u_offset'),
        mode: gl.getUniformLocation(program, 'u_mode'),
        jC: gl.getUniformLocation(program, 'u_julia_c')
    };
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    function render() {
        if (getSectionFn() !== 'mandelbrot-section') { requestAnimationFrame(render); return; }
        
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
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
    
    canvas.addEventListener('wheel', e => {
        if (getSectionFn() !== 'mandelbrot-section') return;
        zoom *= e.deltaY > 0 ? 1.1 : 0.9;
        if (mode === 0) mandelZoom = zoom;
    });
    
    canvas.addEventListener('mousedown', e => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);
    
    canvas.addEventListener('mousemove', e => {
        if (getSectionFn() !== 'mandelbrot-section') return;
        const aspect = canvas.width / canvas.height;
        const mx = (e.clientX / canvas.width) * 2 - 1;
        const my = (e.clientY / canvas.height) * -2 + 1;
        if (mode === 0) { juliaC.x = mx * aspect * zoom + offset.x; juliaC.y = my * zoom + offset.y; }
        if (isDragging) {
            offset.x -= (e.clientX - lastMouse.x) / canvas.width * zoom * aspect * 2;
            offset.y += (e.clientY - lastMouse.y) / canvas.height * zoom * 2;
            lastMouse = { x: e.clientX, y: e.clientY };
            if (mode === 0) { mandelOffset.x = offset.x; mandelOffset.y = offset.y; }
        }
    });
    
    window.addEventListener('keydown', e => {
        if (getSectionFn() !== 'mandelbrot-section') return;
        const key = e.key.toLowerCase();
        if (key === 'm') { mode = 0; zoom = mandelZoom; offset = { ...mandelOffset }; document.getElementById(modeNameId).textContent = 'Mandelbrot'; }
        if (key === 'j') { mode = 1; zoom = 3.0; offset = { x: 0, y: 0 }; document.getElementById(modeNameId).textContent = 'Julia Set'; }
        if (key === 'r') {
            if (mode === 0) { zoom = mandelZoom = 2.5; offset = mandelOffset = { x: -0.5, y: 0 }; }
            else { zoom = 3.0; offset = { x: 0, y: 0 }; }
        }
    });
    
    render();
}
