// ==================== KHOI TAO WEBGL ====================
// Lay WebGL context tu canvas element
export function initWebGL(canvasId) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Trinh duyet khong ho tro WebGL!');
        return null;
    }

    return gl;
}

// ==================== COMPILE SHADER ====================
// Bien dich 1 shader (vertex hoac fragment) tu source code GLSL
function createShader(gl, type, source) {
    const shader = gl.createShader(type);     // Tao shader object
    gl.shaderSource(shader, source);          // Gan source code GLSL
    gl.compileShader(shader);                 // Bien dich

    // Kiem tra loi bien dich
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Loi compile shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// ==================== TAO SHADER PROGRAM ====================
// Link vertex shader + fragment shader thanh 1 program hoan chinh
export function createProgram(gl, vertexSource, fragmentSource) {
    // Compile tung shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    // Tao program va link 2 shader lai
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Kiem tra loi link
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Loi link program:', gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

// ==================== VE LEN MAN HINH ====================
// Gui du lieu dinh + mau len GPU va goi lenh ve
export function drawScene(gl, program, vertices, colors) {
    // Xoa man hinh truoc khi ve moi
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Kich hoat shader program
    gl.useProgram(program);

    // --- GUI DU LIEU TOA DO DINH LEN GPU ---
    const posBuffer = gl.createBuffer();                  // Tao buffer tren GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);            // Chon buffer nay de lam viec
    gl.bufferData(                                        // Gui du lieu tu CPU -> GPU
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    // Ket noi buffer voi attribute a_position trong shader
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);                // Bat attribute
    gl.vertexAttribPointer(                               // Chi dan cach doc du lieu
        aPosition,
        2,              // Moi dinh co 2 so (x, y)
        gl.FLOAT,       // Kieu du lieu: float 32-bit
        false,          // Khong can normalize
        0,              // Stride: 0 = lien tuc, khong co khoang cach
        0               // Offset: bat dau tu dau buffer
    );

    // --- GUI DU LIEU MAU LEN GPU ---
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW
    );

    // Ket noi buffer voi attribute a_color trong shader
    const aColor = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(
        aColor,
        3,              // Moi mau co 3 so (r, g, b)
        gl.FLOAT,
        false,
        0,
        0
    );

    // --- GOI LENH VE ---
    // gl.TRIANGLES: cu moi 3 dinh lien tiep tao thanh 1 tam giac
    // vertices.length / 2: tong so dinh (moi dinh = 2 so x,y)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

    // Don dep buffer (giai phong bo nho GPU)
    gl.deleteBuffer(posBuffer);
    gl.deleteBuffer(colorBuffer);
}
