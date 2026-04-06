// ============================================================================
// MAIN APP - Tab switching và khởi tạo các fractals
// ============================================================================

import { initKochMinkowski } from './koch-minkowski.js';
import { initSierpinski } from './sierpinski.js';
import { initMandelbrotJulia } from './mandelbrot-julia.js';

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.fractal-section');
let currentSection = 'koch-section';

function getCurrentSection() {
    return currentSection;
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        
        currentSection = target;
        
        // Trigger resize for canvas
        window.dispatchEvent(new Event('resize'));
    });
});

// Initialize all fractals (async)
async function init() {
    await Promise.all([
        initKochMinkowski('kochCanvas', 'kochInfo', 'kochType', 'kochDepth', 'kochDepthValue', getCurrentSection),
        initSierpinski('sierpinskiCanvas', 'sierpinskiInfo', 'sierpinskiType', 'sierpinskiDepth', 'sierpinskiDepthValue', getCurrentSection),
        initMandelbrotJulia('mandelbrotCanvas', 'modeName', getCurrentSection)
    ]);
}
init();
