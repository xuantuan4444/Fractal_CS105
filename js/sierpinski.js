// ============================================================================
// SIERPINSKI FRACTAL
// ============================================================================

export async function initSierpinski(canvasId, infoId, typeSelectId, depthSliderId, depthValueId, getSectionFn) {
    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [r, g, b];
    }
    
    function rainbowColor(x, y) {
        const hue = (Math.atan2(y, x) / Math.PI + 1) / 2;
        return hslToRgb(hue, 0.85, 0.55);
    }
    
    function generateTriangle(depth) {
        const vertices = [], colors = [];
        const height = 1.6 * Math.sqrt(3) / 2;
        const v1 = [-0.8, -height / 3], v2 = [0.8, -height / 3], v3 = [0, 2 * height / 3];
        const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        
        function subdivide(p1, p2, p3, d) {
            if (d === 0) {
                vertices.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
                const color = rainbowColor((p1[0] + p2[0] + p3[0]) / 3, (p1[1] + p2[1] + p3[1]) / 3);
                colors.push(...color, ...color, ...color);
                return;
            }
            const m12 = midpoint(p1, p2), m23 = midpoint(p2, p3), m31 = midpoint(p3, p1);
            subdivide(p1, m12, m31, d - 1);
            subdivide(m12, p2, m23, d - 1);
            subdivide(m31, m23, p3, d - 1);
        }
        subdivide(v1, v2, v3, depth);
        return { vertices, colors, triangleCount: Math.pow(3, depth), vertexCount: vertices.length / 2 };
    }
    
    function generateCarpet(depth) {
        const vertices = [], colors = [];
        function subdivide(x, y, s, d) {
            if (d === 0) {
                vertices.push(x, y, x + s, y, x, y + s, x + s, y, x + s, y + s, x, y + s);
                const color = rainbowColor(x + s / 2, y + s / 2);
                for (let i = 0; i < 6; i++) colors.push(...color);
                return;
            }
            const ns = s / 3;
            for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (!(i === 1 && j === 1)) subdivide(x + i * ns, y + j * ns, ns, d - 1);
        }
        subdivide(-0.85, -0.85, 1.7, depth);
        return { vertices, colors, squareCount: Math.pow(8, depth), vertexCount: vertices.length / 2 };
    }
    
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl');
    
    // Load shader from file
    const shaderSource = await fetch('shaders/sierpinski.glsl').then(r => r.text());
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
    
    let currentMode = 'triangle', currentDepth = 0;
    
    function draw() {
        if (getSectionFn() !== 'sierpinski-section') return;
        
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.024, 0.024, 0.07, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        
        const data = currentMode === 'triangle' ? generateTriangle(currentDepth) : generateCarpet(currentDepth);
        
        const aspect = canvas.width / canvas.height;
        let sx = 0.85, sy = 0.85;
        if (aspect > 1) sx /= aspect; else sy *= aspect;
        gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), sx, sy);
        
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.colors), gl.STATIC_DRAW);
        const aColor = gl.getAttribLocation(program, 'a_color');
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, data.vertexCount);
        gl.deleteBuffer(posBuffer);
        gl.deleteBuffer(colorBuffer);
        
        document.getElementById(infoId).textContent = currentMode === 'triangle' 
            ? `Triangles: ${data.triangleCount.toLocaleString()} | Vertices: ${data.vertexCount.toLocaleString()}`
            : `Squares: ${data.squareCount.toLocaleString()} | Vertices: ${data.vertexCount.toLocaleString()}`;
    }
    
    const typeSelect = document.getElementById(typeSelectId);
    const depthSlider = document.getElementById(depthSliderId);
    const depthValue = document.getElementById(depthValueId);
    
    typeSelect.addEventListener('change', () => {
        currentMode = typeSelect.value;
        depthSlider.max = currentMode === 'triangle' ? 8 : 5;
        if (currentDepth > parseInt(depthSlider.max)) {
            currentDepth = parseInt(depthSlider.max);
            depthSlider.value = currentDepth;
            depthValue.textContent = currentDepth;
        }
        draw();
    });
    
    depthSlider.addEventListener('input', () => {
        currentDepth = parseInt(depthSlider.value);
        depthValue.textContent = currentDepth;
        draw();
    });
    
    window.addEventListener('resize', draw);
    draw();
}
