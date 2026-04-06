// ============================================
// VERTEX SHADER
// ============================================
attribute vec2 a_position;
uniform vec2 u_scale;

void main() {
    gl_Position = vec4(a_position * u_scale, 0.0, 1.0);
}

// ============================================
// FRAGMENT SHADER
// ============================================
precision mediump float;
uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
