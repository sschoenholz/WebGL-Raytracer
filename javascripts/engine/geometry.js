function Raytracer(glCanvas) {
	this.glCanvas = glCanvas;
	this.objects = [];
	this.lights = [];
	this.antiAliasing = 1;
	
	//setup the buffers that we will use
	this.build = function() {
		if(!(this.hasOwnProperty("vertexBuffer")))
		{
			
			this.vertexBuffer = this.glCanvas.createBuffer();
			this.vertexBuffer.itemSize = 2;
			this.vertexBuffer.numItems = 4;
			
			this.objectsTexture = this.glCanvas.createTexture();
			this.objectDefinitionsTexture = this.glCanvas.createTexture();
			this.objectMaterialsTexture = this.glCanvas.createTexture();
			this.objectMaterialsExtendedTexture = this.glCanvas.createTexture();
			
			this.lightsTexture = this.glCanvas.createTexture();
			this.lightMaterialsTexture = this.glCanvas.createTexture();
		}	
	
		vertices = [
			-1.0, 1.0,
			-1.0, -1.0,
			1.0, 1.0,
			1.0, -1.0];
			
		this.glCanvas.bindBuffer(glCanvas.ARRAY_BUFFER,this.vertexBuffer);
		this.glCanvas.bufferData(glCanvas.ARRAY_BUFFER,new Float32Array(vertices),glCanvas.STATIC_DRAW);
	}
	
	//build all of the objects
	this.buildScene = function () {
		this.buildObjects();
		this.buildDefinitions();
	}
	
	//builds the objects aka pack them into textures
	this.buildObjects = function () {
		//assemble the two objects
		objectList = [];
		objectPositions = [];
		objectMaterials = [];
		objectMaterialsExtended = [];
		
		//go through each object and create lists of the type, the position and size, the material, and extended material properties
		for(i = 0 ; i < this.objects.length ; i++)
		{
			objectList = objectList.concat([i,this.objects[i].type,0,0]);
			objectPositions = objectPositions.concat(this.objects[i].position);
			objectMaterials = objectMaterials.concat(this.objects[i].material);
			objectMaterialsExtended = objectMaterialsExtended.concat(this.objects[i].materialExtended);
		}

		//determine the minimum power of two texture size that we need to store this information
		sizeList = Math.pow(2.0,Math.ceil(Math.log(this.objects.length)/(2.0*Math.log(2.0))));
			
		//fill the rest with zeros
		for(i = 0 ; i < sizeList*sizeList - this.objects.length ; i++)
		{
			objectList = objectList.concat([0,0,0,0]);
			objectPositions = objectPositions.concat([0.0,0.0,0.0,0.0]);
			objectMaterials = objectMaterials.concat([0.0,0.0,0.0,0.0]);
			objectMaterialsExtended = objectMaterialsExtended.concat([0.0,0.0,0.0,0.0]);
		}
		
		//create arrays that we can link to the gpu
		dataList = new Uint8Array(objectList);
		dataPositions = new Float32Array(objectPositions);
		dataMaterials = new Float32Array(objectMaterials);
		dataMaterialsExtended = new Float32Array(objectMaterialsExtended);
    	
    	//create and bind the textures
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectsTexture);
    	glCanvas.texImage2D(glCanvas.TEXTURE_2D, 0, glCanvas.RGBA, sizeList, sizeList, 0, glCanvas.RGBA, glCanvas.UNSIGNED_BYTE, dataList);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MAG_FILTER, glCanvas.NEAREST);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MIN_FILTER, glCanvas.NEAREST);
    	
    	glCanvas.getExtension("OES_texture_float");
    	
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectDefinitionsTexture);
    	glCanvas.texImage2D(glCanvas.TEXTURE_2D, 0, glCanvas.RGBA, sizeList, sizeList, 0, glCanvas.RGBA, glCanvas.FLOAT, dataPositions);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MAG_FILTER, glCanvas.NEAREST);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MIN_FILTER, glCanvas.NEAREST);
    	
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectMaterialsTexture);
    	glCanvas.texImage2D(glCanvas.TEXTURE_2D, 0, glCanvas.RGBA, sizeList, sizeList, 0, glCanvas.RGBA, glCanvas.FLOAT, dataMaterials);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MAG_FILTER, glCanvas.NEAREST);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MIN_FILTER, glCanvas.NEAREST);
    	
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectMaterialsExtendedTexture);
    	glCanvas.texImage2D(glCanvas.TEXTURE_2D, 0, glCanvas.RGBA, sizeList, sizeList, 0, glCanvas.RGBA, glCanvas.FLOAT, dataMaterialsExtended);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MAG_FILTER, glCanvas.NEAREST);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MIN_FILTER, glCanvas.NEAREST);
    	
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D,null);
	}
	
	//similar to build objects but for lighting
	this.buildLights = function () {
		//assemble the two objects
		lightList = [];
		lightMaterials = [];

		for(i = 0 ; i < this.lights.length ; i++)
		{
			lightList = lightList.concat(this.lights[i].position);
			lightMaterials = lightMaterials.concat(this.lights[i].material);
		}
		
		sizeList = Math.pow(2.0,Math.ceil(Math.log(this.lights.length)/(2.0*Math.log(2.0))));
		
		//fill the rest with zeros
		for(i = 0 ; i < sizeList*sizeList - this.lights.length ; i++)
		{
			lightList = lightList.concat([0,0,0,0]);
			lightMaterials = lightMaterials.concat([0.0,0.0,0.0,0.0]);
		}
				
		dataPositions = new Float32Array(lightList);
		dataMaterials = new Float32Array(lightMaterials);
    	    	    	
    	glCanvas.getExtension("OES_texture_float");
    	
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.lightsTexture);
    	glCanvas.texImage2D(glCanvas.TEXTURE_2D, 0, glCanvas.RGBA, sizeList, sizeList, 0, glCanvas.RGBA, glCanvas.FLOAT, dataPositions);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MAG_FILTER, glCanvas.NEAREST);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MIN_FILTER, glCanvas.NEAREST);
    	
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.lightMaterialsTexture);
    	glCanvas.texImage2D(glCanvas.TEXTURE_2D, 0, glCanvas.RGBA, sizeList, sizeList, 0, glCanvas.RGBA, glCanvas.FLOAT, dataMaterials);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MAG_FILTER, glCanvas.NEAREST);
    	glCanvas.texParameteri(glCanvas.TEXTURE_2D, glCanvas.TEXTURE_MIN_FILTER, glCanvas.NEAREST);
    	
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D,null);
	}
	
	//draw the geometry. This amounts to binding all of the textures and settings the uniforms that say how many objects we have,
	//the size of the texture that we're sending to the gpu etc...
	this.draw = function () {
		glCanvas.bindBuffer(glCanvas.ARRAY_BUFFER,this.vertexBuffer);
		glCanvas.vertexAttribPointer(glCanvas.shaderProgram.vertexPositionAttribute,this.vertexBuffer.itemSize,glCanvas.FLOAT,false,0,0);
		
		glCanvas.activeTexture(glCanvas.TEXTURE0);
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectsTexture);
    	glCanvas.uniform1i(glCanvas.shaderProgram.objects, 0);
    	
    	glCanvas.activeTexture(glCanvas.TEXTURE1);
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectDefinitionsTexture);
    	glCanvas.uniform1i(glCanvas.shaderProgram.objectDefinitions, 1);
    	
    	glCanvas.activeTexture(glCanvas.TEXTURE2);
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectMaterialsTexture);
    	glCanvas.uniform1i(glCanvas.shaderProgram.objectMaterials, 2);
    	
    	glCanvas.activeTexture(glCanvas.TEXTURE3);
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.objectMaterialsExtendedTexture);
    	glCanvas.uniform1i(glCanvas.shaderProgram.objectMaterialsExtended, 3);
    	
    	glCanvas.activeTexture(glCanvas.TEXTURE4);
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.lightsTexture);
    	glCanvas.uniform1i(glCanvas.shaderProgram.lights, 4);
    	
    	glCanvas.activeTexture(glCanvas.TEXTURE5);
    	glCanvas.bindTexture(glCanvas.TEXTURE_2D, this.lightMaterialsTexture);
    	glCanvas.uniform1i(glCanvas.shaderProgram.lightMaterials, 5);
    	
    	glCanvas.uniform1i(glCanvas.shaderProgram.numObjects,this.objects.length);
    	glCanvas.uniform1i(glCanvas.shaderProgram.numLights,this.lights.length);
    	glCanvas.uniform1i(glCanvas.shaderProgram.antiAliasing,this.antiAliasing);
    	glCanvas.uniform1f(glCanvas.shaderProgram.objectTextureSize,Math.pow(2.0,Math.ceil(Math.log(this.objects.length)/(2.0*Math.log(2.0)))));
    	glCanvas.uniform1f(glCanvas.shaderProgram.lightTextureSize,Math.pow(2.0,Math.ceil(Math.log(this.lights.length)/(2.0*Math.log(2.0)))));
		
		glCanvas.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
	}
	
	return this;
}

//definition for a sphere
function Sphere() {
	this.type = 0;
	this.position = [0.0,0.0,0.0,1.0];
	this.material = [1.0,1.0,1.0,1.0];
	this.materialExtended = [0.0,0.0,0.0,0.0];
	
	return this;
}

//definition for a plane
function Plane() {
	this.type = 1;
	this.position = [0.0,1.0,0.0,0.0];
	this.material = [1.0,1.0,1.0,1.0];
	this.materialExtended = [0.0,0.0,0.0,0.0];

	return this;
}

//definition for a light
function Light() {
	this.position = [0.0,0.0,0.0,0.0];
	this.material = [1.0,1.0,1.0,1.0];

	return this;
}