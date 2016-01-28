precision highp float;
uniform sampler2D tx_cam;
uniform sampler2D tx_lut;
uniform float u_mix;
uniform bool u_blur;
uniform vec2 u_resolution;

#pragma glslify: lut = require(glsl-lut)
#pragma glslify: blur = require('glsl-fast-gaussian-blur')

void main() {
	vec2 uv = vec2(gl_FragCoord.xy / u_resolution.xy);

	// flip
	uv.y = 1.0 - uv.y;


	vec4 color =  texture2D(tx_cam, uv);
	vec4 filterSrc = color;
	// vec4 color = blur(tx_cam, uv, u_resolution.xy, vec2(1.0, 0.0));

	if(u_blur) {
		// vec4 b1a = blur3(tx_cam, uv, u_resolution.xy, vec2(1.0, 0.0)) / 6.0;
		// vec4 b2a = blur2(tx_cam, uv, u_resolution.xy, vec2(1.0, 0.0)) / 6.0;
		// vec4 b3a = blur1(tx_cam, uv, u_resolution.xy, vec2(1.0, 0.0)) / 6.0;

		// vec4 b1b = blur3(tx_cam, uv, u_resolution.xy, vec2(0.0, 1.0)) / 6.0;
		// vec4 b2b = blur2(tx_cam, uv, u_resolution.xy, vec2(0.0, 1.0)) / 6.0;
		// vec4 b3b = blur1(tx_cam, uv, u_resolution.xy, vec2(0.0, 1.0)) / 6.0;

		filterSrc = blur(tx_cam, uv, u_resolution.xy, vec2(1.0, 0.0));
	}

	vec4 filter = lut(filterSrc, tx_lut);
  gl_FragColor = mix(color, filter, u_mix);
  // gl_FragColor = color;
}