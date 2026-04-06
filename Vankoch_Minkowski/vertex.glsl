attribute vec2 a_position;
uniform vec2 u_scale; // Đổi thành vec2 để chứa scaleX và scaleY
void main() {
    gl_Position = vec4(a_position * u_scale, 0.0, 1.0);
}