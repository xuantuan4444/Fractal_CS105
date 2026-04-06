// ============================================================================
// KOCH & MINKOWSKI FRACTAL
// ============================================================================

export async function initKochMinkowski(canvasId, infoId, typeSelectId, depthSliderId, depthValueId, getSectionFn) {
    const CONFIG = {
        koch: { maxLevel: 5, scale: 0.7, colors: ["#4a90d9", "#7c5cbf", "#2aab85", "#d9884a", "#4a9fd9", "#d94a7c"] },
        minkowski: { maxLevel: 4, scale: 0.7, colors: ["#4a90d9", "#7c5cbf", "#2aab85", "#d9884a", "#d94a7c"] }
    };

    function kochPoints(p1, p2, level) {
        if (level === 0) return [p1, p2];
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const a = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
        const b = { x: p1.x + 2 * dx / 3, y: p1.y + 2 * dy / 3 };
        const angle = -Math.PI / 3;
        const peak = {
            x: a.x + (b.x - a.x) * Math.cos(angle) - (b.y - a.y) * Math.sin(angle),
            y: a.y + (b.x - a.x) * Math.sin(angle) + (b.y - a.y) * Math.cos(angle)
        };
        return [...kochPoints(p1, a, level - 1).slice(0, -1),
                ...kochPoints(a, peak, level - 1).slice(0, -1),
                ...kochPoints(peak, b, level - 1).slice(0, -1),
                ...kochPoints(b, p2, level - 1)];
    }

    function getKochCoords(level) {
        const r = 1.0, angleOffset = Math.PI / 2;
        const vertices = [];
        for (let i = 0; i < 3; i++) {
            vertices.push({ x: r * Math.cos(angleOffset + i * 2 * Math.PI / 3), y: r * Math.sin(angleOffset + i * 2 * Math.PI / 3) });
        }
        let pts = [];
        for (let i = 0; i < 3; i++) {
            pts.push(...kochPoints(vertices[i], vertices[(i + 1) % 3], level).slice(0, -1));
        }
        pts.push(pts[0]);
        return pts;
    }

    function minkowskiPoints(p1, p2, level) {
        if (level === 0) return [p1, p2];
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const fx = dx / 4, fy = dy / 4, ox = dy / 4, oy = -dx / 4;
        let cur = { x: p1.x, y: p1.y };
        const pts = [cur];
        [[fx, fy], [ox, oy], [fx, fy], [-ox, -oy], [-ox, -oy], [fx, fy], [ox, oy], [fx, fy]].forEach(m => {
            cur = { x: cur.x + m[0], y: cur.y + m[1] };
            pts.push(cur);
        });
        const result = [];
        for (let i = 0; i < pts.length - 1; i++) result.push(...minkowskiPoints(pts[i], pts[i + 1], level - 1).slice(0, -1));
        result.push(pts[pts.length - 1]);
        return result;
    }

    function getMinkowskiCoords(level) {
        const h = 1.0 / Math.sqrt(2);
        const vertices = [{ x: h, y: -h }, { x: h, y: h }, { x: -h, y: h }, { x: -h, y: -h }];
        let pts = [];
        for (let i = 0; i < 4; i++) pts.push(...minkowskiPoints(vertices[i], vertices[(i + 1) % 4], level).slice(0, -1));
        pts.push(pts[0]);
        return pts;
    }

    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl');
    
    // Load shader from file
    const shaderSource = await fetch('shaders/koch-minkowski.glsl').then(r => r.text());
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
    gl.useProgram(program);
    
    const posBuffer = gl.createBuffer();
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    
    const colorLoc = gl.getUniformLocation(program, 'u_color');
    const scaleLoc = gl.getUniformLocation(program, 'u_scale');
    
    let currentData = [], currentConfig = CONFIG.koch, currentDepth = 0;
    
    function precalculate(type) {
        currentConfig = CONFIG[type];
        currentData = [];
        const gen = type === 'koch' ? getKochCoords : getMinkowskiCoords;
        for (let l = 0; l <= currentConfig.maxLevel; l++) currentData.push(gen(l));
    }
    
    function draw() {
        if (getSectionFn() !== 'koch-section') return;
        
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        const pts = currentData[currentDepth];
        const flat = new Float32Array(pts.length * 2);
        pts.forEach((p, i) => { flat[i * 2] = p.x; flat[i * 2 + 1] = p.y; });
        
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        
        const hex = currentConfig.colors[currentDepth];
        const bigint = parseInt(hex.replace('#', ''), 16);
        gl.uniform4f(colorLoc, ((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255, 1);
        
        const aspect = canvas.width / canvas.height;
        let sx = currentConfig.scale, sy = currentConfig.scale;
        if (aspect > 1) sx /= aspect; else sy *= aspect;
        gl.uniform2f(scaleLoc, sx, sy);
        
        gl.drawArrays(gl.LINE_STRIP, 0, pts.length);
        document.getElementById(infoId).textContent = `Edges: ${(pts.length - 1).toLocaleString()} | Vertices: ${pts.length.toLocaleString()}`;
    }
    
    const typeSelect = document.getElementById(typeSelectId);
    const depthSlider = document.getElementById(depthSliderId);
    const depthValue = document.getElementById(depthValueId);
    
    typeSelect.addEventListener('change', () => {
        precalculate(typeSelect.value);
        depthSlider.max = currentConfig.maxLevel;
        if (currentDepth > currentConfig.maxLevel) {
            currentDepth = currentConfig.maxLevel;
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
    precalculate('koch');
    draw();
}
