//Initialize an openGL context
function InitializeWebGL(canvas) {
  gl = null;
  
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(e) {}
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }
  
  if(gl){
  	gl.viewportWidth = canvas.width;
  	gl.viewportHeight = canvas.height;
  }  
  
  InitializeShaders(gl);
  
  return gl;
}

//Initialize shaders
function LoadShader(glCanvas,id)
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = glCanvas.createShader(glCanvas.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = glCanvas.createShader(glCanvas.VERTEX_SHADER);
	} else {
		return null;
	}

	glCanvas.shaderSource(shader, str);
	glCanvas.compileShader(shader);

	if (!glCanvas.getShaderParameter(shader, glCanvas.COMPILE_STATUS)) {
		alert(glCanvas.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function InitializeShaders(glCanvas)
{
	var fragmentShader = LoadShader(glCanvas,"shader-fs");
	var vertexShader = LoadShader(glCanvas,"shader-vs");
	
	glCanvas.shaderProgram = glCanvas.createProgram();
	
	glCanvas.attachShader(glCanvas.shaderProgram,vertexShader);
	glCanvas.attachShader(glCanvas.shaderProgram,fragmentShader);
	glCanvas.linkProgram(glCanvas.shaderProgram);
	
	if(!glCanvas.getProgramParameter(glCanvas.shaderProgram,glCanvas.LINK_STATUS)) {
		alert("Could not initialize shaders");
	}
	
	glCanvas.useProgram(glCanvas.shaderProgram);
	
	glCanvas.shaderProgram.vertexPositionAttribute = glCanvas.getAttribLocation(glCanvas.shaderProgram,"aVertexPosition");
	glCanvas.enableVertexAttribArray(glCanvas.shaderProgram.vertexPositionAttribute);
			
	glCanvas.shaderProgram.resolution = gl.getUniformLocation(glCanvas.shaderProgram,"uResolution");
	glCanvas.uniform2f(glCanvas.shaderProgram.resolution,glCanvas.viewportWidth,glCanvas.viewportHeight);
	
	glCanvas.shaderProgram.objects = gl.getUniformLocation(glCanvas.shaderProgram,"objects");
	glCanvas.shaderProgram.objectDefinitions = gl.getUniformLocation(glCanvas.shaderProgram,"objectDefinitions");
	glCanvas.shaderProgram.objectMaterials = gl.getUniformLocation(glCanvas.shaderProgram,"objectMaterials");
	glCanvas.shaderProgram.objectMaterialsExtended = gl.getUniformLocation(glCanvas.shaderProgram,"objectMaterialsExtended");
	
	glCanvas.shaderProgram.lights = gl.getUniformLocation(glCanvas.shaderProgram,"lights");
	glCanvas.shaderProgram.lightMaterials = gl.getUniformLocation(glCanvas.shaderProgram,"lightMaterials");
	
	glCanvas.shaderProgram.numObjects = gl.getUniformLocation(glCanvas.shaderProgram,"numObjects");
	glCanvas.shaderProgram.numLights = gl.getUniformLocation(glCanvas.shaderProgram,"numLights");
	glCanvas.shaderProgram.objectTextureSize = gl.getUniformLocation(glCanvas.shaderProgram,"objectTextureSize");
	glCanvas.shaderProgram.lightTextureSize = gl.getUniformLocation(glCanvas.shaderProgram,"lightTextureSize");
	glCanvas.shaderProgram.antiAliasing = gl.getUniformLocation(glCanvas.shaderProgram,"antiAliasing");

		
	InitializeResources(glCanvas);
}

function InitializeResources(glCanvas)
{

}


