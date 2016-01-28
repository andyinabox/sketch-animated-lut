// http://patriciogonzalezvivo.com/2015/thebookofshaders/09/
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;

    st *= 8.0;      // Scale up the space by 8
    st = fract(st); // Wrap arround 1.0

    // st.y = 1.0 - st.y;

    vec3 color1 = vec3(st, 0.0);
    vec3 color2 = vec3(0.0, st);
    vec3 color = mix(color1, color2, sin(u_time / 1000.0));
    
	gl_FragColor = vec4(color,1.0);
}