var shell = require('gl-now')();
var createShader = require('gl-shader');
var createTexture = require('gl-texture2d');
var createFbo = require('gl-fbo');
var gessoCanvas = require('a-big-triangle');
var webcamGrabber = require('webcam-grabber');
var glslify = require('glslify');
var now = require('nowify');
var mouse = require('mouse-position')();
var clone = require('lodash.clone');
var pip = require('gl-texture2d-pip')

var dat = require('exdat');

var LUT_WIDTH = 512;
var LUT_HEIGHT = 512;

// our video source
var video = webcamGrabber(600,400);

// additional stuff
var glsl = {
	'main': {
		vert: glslify('./shaders/main.vert')
		, frag: glslify('./shaders/main.frag')
	}
	, 'Default': {
		vert: glslify('./shaders/lut-default.vert')
		, frag: glslify('./shaders/lut-default.frag')
	}
	, 'Tiles': {
		vert: glslify('./shaders/lut-default.vert')
		, frag: glslify('./shaders/lut-tile1.frag')
	}
	, 'Radial Stripes': {
		vert: glslify('./shaders/lut-default.vert')
		, frag: glslify('./shaders/lut-stripes1.frag')
	}
}
var shaders = {};
var textures = {};
var fbos = {};

// params object for gui
var params = {
	lut: glsl['Default']
	, mix: 1.0
	, blur: true
}

var gui;
	// main stuff
	// , txMain
	// , shaderMain

	// LUT stuff
	// , txLut
	// , shaderLut
	// , fboLut;

// function getTex2d(gl, path) {
//     var obj = {
//         image: new Image(),
//         texture: null
//     };
//     obj.image.onload = function() {
//         obj.texture = createTexture(gl, obj.image)
//         obj.texture.minFilter = obj.texture.magFilter = gl.LINEAR;
//     };
//     obj.image.src = path;
//     return obj;
// }

// switch out the lut when selected
function onLutChange(key) {
	var gl = shell.gl
		, files = glsl[key];

	console.log('onLutChange', glsl);

	if(!shaders.lut) {
		shaders.lut = createShader(gl, files.vert, files.frag);
	} else {
		shaders.lut.update(files.vert, files.frag);
	}
}


shell.on('gl-init', function() {
	var gl = shell.gl;

	// create the main shader
	shaders.main = createShader(gl, glsl.main.vert, glsl.main.frag);

	// fbos
	fbos.lut = createFbo(gl, [LUT_WIDTH, LUT_HEIGHT]);


	// initialize gui stuff
	initGui();


	var initLookup = "Default";
	if(window.location.hash) {
		initLookup = window.location.hash.replace('#', '');
	}
	onLutChange(initLookup);

});

shell.on('tick', function() {
	var gl = shell.gl;

	// is there video ready?
	if(video.readyState === video.HAVE_ENOUGH_DATA) {
			if(textures.cam) {
		  	textures.cam.setPixels(video);
			} else {
				textures.cam = createTexture(gl, video);
			} 
	}	

	// draw to fbo
	renderLut(gl);
});

shell.on('gl-render', function(t) {
	var gl = shell.gl;


	renderMain(gl);

});

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
});


function renderLut(gl) {
	fbos.lut.bind();
	if(shaders.lut) {
		shaders.lut.bind();
		setDefaultUniforms(gl, shaders.lut, LUT_WIDTH, LUT_HEIGHT);
	}
	gessoCanvas(gl);
}

function renderMain(gl) {


	// bind shader
	shaders.main.bind();

	try {
  	shaders.main.uniforms.tx_cam = textures.cam.bind(0);
	} catch(e) {
		console.log("Waiting for camera...");
	}

	shaders.main.uniforms.tx_lut = fbos.lut.color[0].bind(1);

	setDefaultUniforms(gl, shaders.main);

	shaders.main.uniforms.u_mix = params.mix;
	shaders.main.uniforms.u_blur = params.blur;

	// draw big triangle
	gessoCanvas(gl);	

  pip([fbos.lut.color[0]]);	

}


function initGui() {
	// setup gui
	gui = new dat.GUI({ autoPlace: false });
	gui.add(params, 'mix', 0.0, 1.0);
	gui.add(params, 'blur', true);

	var keys = Object.keys(glsl);
	var mainIndex = keys.indexOf('main');

	if(mainIndex > -1) {
		keys.splice(mainIndex, 1);
	}

	gui.add(params, 'lut', keys).onChange(onLutChange);	

	var guiContainer = document.createElement('nav');
	guiContainer.id = 'gui';
	guiContainer.appendChild(gui.domElement);
	document.body.appendChild(guiContainer);
}

var startTime

function setDefaultUniforms(gl, shader, width, height) {
	startTime = startTime || now();

	var w = width || gl.drawingBufferWidth
		, h = height || gl.drawingBufferHeight
		, mx = mouse[0]
		, my = mouse[1];


	// console.log('uniforms', w, h, mx, my);

	shader.uniforms.u_time = now() - startTime;
	shader.uniforms.u_resolution = [w, h];
	shader.uniforms.u_mouse = [mx/w, mx/h];
}