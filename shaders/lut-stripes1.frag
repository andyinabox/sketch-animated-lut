#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;
	// scale up based on mouse x pos
	float mult = ceil(u_mouse.x * 10.0);
  float speed = ceil(u_mouse.y * 5000.0);
	
  st *= mult;    


    // st = fract(st); // Wrap arround 1.0

    // // st.y = 1.0 - st.y;

    // vec3 color1 = vec3(st, 0.0);
    // vec3 color2 = vec3(0.0, st);
    // vec3 color = mix(color1, color2, sin(u_time / 1000.0));
    
  // get inital value
  float colorVal = sqrt(pow(mult - st.t, 2.0) + pow(st.s, 2.0));
  // add time element
  colorVal = colorVal + u_time/speed; // sin(u_time / 5000.0);
  // wrap around 1.0
  colorVal = fract(colorVal);
    
	gl_FragColor = vec4(colorVal, colorVal, colorVal,1.0);
}