// ============================================
// VERTEX SHADER
// ============================================
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color;
uniform vec2 u_scale;

void main() {
    gl_Position = vec4(a_position * u_scale, 0.0, 1.0);
    v_color = a_color;
}

// ============================================
// FRAGMENT SHADER  
// ============================================
precision mediump float;
varying vec3 v_color;

void main() {
    gl_FragColor = vec4(v_color, 1.0);
}
