// ==================== MAIN.JS - DIEU PHOI CHINH ====================
// File nay ket noi tat ca module lai voi nhau va xu ly su kien UI

import { initWebGL, createProgram, drawScene } from './utils.js';
import { vertexShaderSource, fragmentShaderSource } from './shader.js';
import { generateSierpinskiTriangle } from './sierpinskiTriangle.js';
import { generateSierpinskiCarpet } from './sierpinskiCarpet.js';

// ==================== HAM CHUYEN DOI MAU HSL -> RGB ====================
// HSL (Hue, Saturation, Lightness) truc quan hon RGB khi tao gradient
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        // Khi saturation = 0 → mau xam
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
}

// ==================== BANG MAU (COLOR SCHEMES) ====================
// Moi scheme la 1 ham nhan (x, y) tra ve [r, g, b]
const COLOR_SCHEMES = {
    // Cau vong: mau thay doi theo goc tu tam
    rainbow: (x, y) => {
        const angle = Math.atan2(y, x);          // Goc tu tam (radian)
        const hue = (angle / Math.PI + 1) / 2;   // Chuyen sang [0, 1]
        return hslToRgb(hue, 0.85, 0.55);
    },

    // Tong lanh: xanh duong - tim
    cool: (x, y) => {
        const d = Math.sqrt(x * x + y * y) / 1.2;  // Khoang cach tu tam [0~1]
        return [0.1 + d * 0.2, 0.3 + d * 0.3, 0.65 + d * 0.3];
    },

    // Tong nong: do - cam - vang
    warm: (x, y) => {
        const d = Math.sqrt(x * x + y * y) / 1.2;
        return [0.85 + d * 0.15, 0.2 + d * 0.5, 0.05 + d * 0.1];
    },

    // Neon: mau bao hoa toi da, sac net
    neon: (x, y) => {
        const angle = Math.atan2(y, x);
        const hue = (angle / Math.PI + 1) / 2;
        return hslToRgb(hue, 1.0, 0.5);
    }
};

// ==================== TRANG THAI UNG DUNG ====================
let currentMode = 'triangle';          // Che do hien tai: 'triangle' hoac 'carpet'
let currentDepth = 4;                  // Do sau de quy hien tai
let currentColorScheme = 'rainbow';    // Bang mau hien tai

// ==================== KHOI TAO WEBGL ====================
const gl = initWebGL('glCanvas');
const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

// Dat mau nen (goi 1 lan duy nhat)
gl.clearColor(0.024, 0.024, 0.07, 1.0);  // Mau nen toi (#060612)

// ==================== HAM RENDER CHINH ====================
// Goi moi khi nguoi dung thay doi bat ky setting nao
function render() {
    const scheme = COLOR_SCHEMES[currentColorScheme];
    let data;

    if (currentMode === 'triangle') {
        // Sinh du lieu tam giac Sierpinski
        data = generateSierpinskiTriangle(currentDepth, scheme);
        document.getElementById('info').textContent =
            `Triangles: ${data.triangleCount.toLocaleString()} | Vertices: ${data.vertexCount.toLocaleString()}`;
    } else {
        // Sinh du lieu tham Sierpinski
        data = generateSierpinskiCarpet(currentDepth, scheme);
        document.getElementById('info').textContent =
            `Squares: ${data.squareCount.toLocaleString()} | Vertices: ${data.vertexCount.toLocaleString()}`;
    }

    // Gui len GPU va ve
    drawScene(gl, program, data.vertices, data.colors);
}

// ==================== XU LY SU KIEN UI ====================

// Lay cac element DOM
const btnTriangle = document.getElementById('btnTriangle');
const btnCarpet = document.getElementById('btnCarpet');
const depthSlider = document.getElementById('depthSlider');
const depthValue = document.getElementById('depthValue');
const colorSelect = document.getElementById('colorScheme');

// Nut chuyen sang Triangle
btnTriangle.addEventListener('click', () => {
    currentMode = 'triangle';
    btnTriangle.classList.add('active');
    btnCarpet.classList.remove('active');

    // Triangle cho phep depth cao hon (toi da 8)
    depthSlider.max = 8;
    if (currentDepth > 8) {
        currentDepth = 8;
        depthSlider.value = 8;
        depthValue.textContent = '8';
    }

    render();
});

// Nut chuyen sang Carpet
btnCarpet.addEventListener('click', () => {
    currentMode = 'carpet';
    btnCarpet.classList.add('active');
    btnTriangle.classList.remove('active');

    // Carpet gioi han depth = 5 (vi 8^5 = 32768 hinh vuong, nhieu hon se cham)
    depthSlider.max = 5;
    if (currentDepth > 5) {
        currentDepth = 5;
        depthSlider.value = 5;
        depthValue.textContent = '5';
    }

    render();
});

// Slider thay doi depth
depthSlider.addEventListener('input', (e) => {
    currentDepth = parseInt(e.target.value);
    depthValue.textContent = currentDepth;
    render();
});

// Dropdown thay doi bang mau
colorSelect.addEventListener('change', (e) => {
    currentColorScheme = e.target.value;
    render();
});

// ==================== VE LAN DAU ====================
render();
