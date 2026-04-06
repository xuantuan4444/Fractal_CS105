// ============================================
// VERTEX SHADER
// ============================================
attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}

// ============================================
// FRAGMENT SHADER
// ============================================
precision highp float;
uniform vec2 u_resolution;
uniform float u_zoom;
uniform vec2 u_offset;
uniform int u_mode;
uniform vec2 u_julia_c;

vec3 getGlowColor(float t) {
    if (t <= 0.0) return vec3(0.0);
    
    vec3 deepBlue = vec3(0.0, 0.0, 0.2);
    vec3 vibrantBlue = vec3(0.0, 0.1, 0.6);
    vec3 brightCyan = vec3(0.0, 0.9, 1.0);
    vec3 brightYellow = vec3(1.0, 1.0, 0.8);
    
    vec3 color;
    if (t < 0.15) {
        color = mix(deepBlue, vibrantBlue, t / 0.15);
    } else if (t < 0.5) {
        color = mix(vibrantBlue, brightCyan, (t - 0.15) / 0.35);
    } else {
        color = mix(brightCyan, brightYellow, (t - 0.5) / 0.5);
    }
    
    return color * pow(t, 0.6) * 1.5;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    vec2 c, z;
    
    if (u_mode == 0) {
        c = uv * u_zoom + u_offset;
        z = vec2(0.0);
    } else {
        c = u_julia_c;
        z = uv * u_zoom + u_offset;
    }
    
    float iter = 0.0;
    const float max_iter = 300.0;
    
    for (float i = 0.0; i < max_iter; i++) {
        float x = z.x * z.x - z.y * z.y + c.x;
        float y = 2.0 * z.x * z.y + c.y;
        z = vec2(x, y);
        if (length(z) > 2.0) break;
        iter++;
    }
    
    // Smooth coloring
    if (iter < max_iter) {
        float log_zn = log(z.x * z.x + z.y * z.y) / 2.0;
        float nu = log(log_zn / log(2.0)) / log(2.0);
        iter = iter + 1.0 - nu;
    }
    
    float t = iter / max_iter;
    vec3 rgb = (iter >= max_iter) ? vec3(0.0) : getGlowColor(t);
    
    gl_FragColor = vec4(rgb, 1.0);
}
