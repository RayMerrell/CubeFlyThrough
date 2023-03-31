function objCube (Size, Position, Energy, Program){
	
	this.GetRotationValues = function(){
		this.RotX = document.getElementById("inpCubRotX").value;
		this.RotY = document.getElementById("inpCubRotY").value;
		this.RotZ = document.getElementById("inpCubRotZ").value;
	};
	this.GetOscillationValues = function(){
		this.OscX = document.getElementById("inpCubOscX").value;
		this.OscY = document.getElementById("inpCubOscY").value;
		this.OscZ = document.getElementById("inpCubOscZ").value;
	};	

	
	this.Animate = function(){
		var TimeNow = new Date().getTime();
		if (this.LastTime != 0 ){
			var TimeElapsed = (TimeNow - this.LastTime) /1000;
			this.GetRotationValues();
			this.RotationX += (this.RotX * this.SpinRate * TimeElapsed);
			this.RotationY += (this.RotY * this.SpinRate * TimeElapsed);
			this.RotationZ += (this.RotZ * this.SpinRate * TimeElapsed);
			this.GetOscillationValues();
			this.OscillationX += (this.OscX * this.OscillationRate * TimeElapsed)*2;
			this.OscillationY += (this.OscY * this.OscillationRate * TimeElapsed)*2;
			this.OscillationZ += (this.OscZ * this.OscillationRate * TimeElapsed);			
		}
		mat4.identity(this.matModelView);
		mat4.translate (this.matModelView, this.matModelView, this.StartingPosition);
		mat4.translate (this.matModelView, this.matModelView, vec3.fromValues(Math.cos(this.OscillationX)*15,Math.cos(this.OscillationY + 090)*15, Math.tan(this.OscillationZ)));	
	
		this.matRotate = mat4.create();		
		mat4.identity(this.matRotate);
		if (this.RotationX) mat4.rotateX(this.matRotate, this.matRotate, degToRad(this.RotationX));
		if (this.RotationY) mat4.rotateY(this.matRotate, this.matRotate, degToRad(this.RotationY));	
		if (this.RotationZ) mat4.rotateZ(this.matRotate, this.matRotate, degToRad(this.RotationZ));
		mat4.multiply(this.matModelView, this.matModelView, this.matRotate);
		
		mat3.identity(this.matNormal);
		mat3.fromMat4(this.matNormal, this.matRotate);
		mat4.scale(this.matModelView, this.matModelView, this.Size);
		this.LastTime = TimeNow;
	}
	
	this.ResetRot = function(){
		document.getElementById("inpCubRotX").value = 0;
		document.getElementById("inpCubRotY").value = 0;
		document.getElementById("inpCubRotZ").value = 0;
		document.getElementById("numCubRotX").value = 0;	
		document.getElementById("numCubRotY").value = 0;	
		document.getElementById("numCubRotZ").value = 0;
		this.RotationX=0;
		this.RotationY=0;
		this.RotationZ=0; 
	};
	this.ResetOsc = function(){
		document.getElementById("inpCubOscX").value = 0;
		document.getElementById("inpCubOscY").value = 0;
		document.getElementById("inpCubOscZ").value = 0;
		document.getElementById("numCubOscX").value = 0;	
		document.getElementById("numCubOscY").value = 0;	
		document.getElementById("numCubOscZ").value = 0;
	};
	
	this.Draw = function(Program){
		GC.uniformMatrix4fv(Program.UmatModelView, false, this.matModelView);
		GC.uniformMatrix3fv(Program.UmatNormal, false, this.matNormal);

		
		GC.uniform1i(Program.UUseLights, true);
		GC.uniform3f(Program.UAmbientColour, parseFloat(ALightR), parseFloat(ALightG), parseFloat(ALightB));


		
		GC.bindBuffer(GC.ARRAY_BUFFER, CubeVPB);
		GC.vertexAttribPointer(Program.VertexPositionAttribute, CubeVPB.ItemSize, GC.FLOAT, false,0,0);
		GC.bindBuffer(GC.ARRAY_BUFFER, CubeVNB);
		GC.vertexAttribPointer(Program.VertexNormalAttribute, CubeVNB.ItemSize, GC.FLOAT, false, 0,0);
		GC.bindBuffer(GC.ARRAY_BUFFER, CubeVTB);
		GC.vertexAttribPointer(Program.TextureCoordAttribute, CubeVTB.ItemSize, GC.FLOAT, false,0,0);

		GC.bindBuffer(GC.ELEMENT_ARRAY_BUFFER, CubeVIB);
		//Drawing through element offsets. All offsets are multiplied by two coz of the size of bytes or something
		//top
		GC.uniform1i(Program.USampler, 0);	
		GC.drawElements(GC.TRIANGLES, 6, GC.UNSIGNED_SHORT, 0);	//start of element array		

		//bottom
		GC.uniform1i(Program.USampler, 1);	
		GC.drawElements(GC.TRIANGLES, 6, GC.UNSIGNED_SHORT, 12); //6 elements in
		//sides
		GC.uniform1i(Program.USampler, 2);		
		GC.drawElements(GC.TRIANGLES, 24, GC.UNSIGNED_SHORT, 24); //12 elements in
	};
	
	if (Size != 0){
		this.Size = vec3.fromValues(Size, Size, Size);
	}else{
		var a = Math.random();
		this.Size = vec3.fromValues(a, a, a);
	}

	this.StartingPosition = Position;
	this.Position = this.StartingPosition;



	this.RotationX=0;
	this.RotationY=0;
	this.RotationZ=0; 
	this.OscillationX=0;
	this.OscillationY=0;
	this.OscillationZ=0;

	this.LastTime=0;
	this.RotX=0;
	this.RotY=0;
	this.RotZ=0;
	this.OscX=0;
	this.OscY=0;
	this.OscZ=0;


	
	
	if (Energy != 0){
		this.SpinRate = Energy * 360;
		this.OscillationRate = Energy;
	}else{	
		this.SpinRate = Math.random() * 360;
		this.OscillationRate = Math.random();
	};
	this.matModelView =  mat4.create();
	this.matRotate = mat3.create();
	this.matNormal = mat3.create();
};
var CubeVIB;
var CubeVPB;
var CubeVTB;
var CubeVNB;

var TextureCoords;

var TextureTop =0;
var TextureSide=0;
var TextureBottom=0;

function InnitCubeBuffers(Program){
		var CubeVertices = [
		  // Top face
		  -1,  1, -1,
		  -1,  1,  1,
		   1,  1,  1,
		   1,  1, -1,

		  // Bottom face
		  -1, -1, -1,
		   1, -1, -1,
		   1, -1,  1,
		  -1, -1,  1,

		// Front face
		  -1, -1,  1,
		   1, -1,  1,
		   1,  1,  1,
		  -1,  1,  1,

		  // Back face
		  -1, -1, -1,
		  -1,  1, -1,
		   1,  1, -1,
		   1, -1, -1,

		  // Right face
		   1, -1, -1,
		   1,  1, -1,
		   1,  1,  1,
		   1, -1,  1,

		  // Left face
		  -1, -1, -1,
		  -1, -1,  1,
		  -1,  1,  1,
		  -1,  1, -1
    ];
	//Vertex Position Buffer
	CubeVPB = GC.createBuffer();
	GC.bindBuffer(GC.ARRAY_BUFFER, CubeVPB);
	GC.bufferData(GC.ARRAY_BUFFER, new Float32Array(CubeVertices), GC.STATIC_DRAW);
	CubeVPB.ItemSize = 3;
	CubeVPB.NumItems = 24;
	GC.vertexAttribPointer(Program.VertexPositionAttribute, CubeVPB.ItemSize, GC.FLOAT, false, 0, 0);
	//Vertex Index Buffer
	var CubeVertexIndex = [
		0, 1, 2,      0, 2, 3,    // Top face
		4, 5, 6,      4, 6, 7,    // Bottom face 
		8, 9, 10,     8, 10, 11, // Front face
		12, 13, 14,   12, 14, 15, // Back face 	
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
    ];
	CubeVIB = GC.createBuffer();
	GC.bindBuffer(GC.ELEMENT_ARRAY_BUFFER, CubeVIB);
	GC.bufferData(GC.ELEMENT_ARRAY_BUFFER, new Uint16Array(CubeVertexIndex), GC.STATIC_DRAW);
	CubeVIB.ItemSize = 1;
	CubeVIB.NumItems = 36;
	
	//Vertex Normal Buffer
	CubeVNB = GC.createBuffer();
	GC.bindBuffer(GC.ARRAY_BUFFER, CubeVNB);
	var VertexNormals  =[
      // Top face
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,

      // Bottom face
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
	// Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,

      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,

      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
	];
	GC.bufferData(GC.ARRAY_BUFFER, new Float32Array(VertexNormals), GC.DYNAMIC_DRAW);
	CubeVNB.ItemSize = 3;
	CubeVNB.NumItems = 24;

}
	
function InnitCubeTextures(){
//Vertex Texture Co-Ordinate Buffer

	TextureCoords = [
		  // Top face
		  0.0, 1.0,
		  0.0, 0.0,
		  1.0, 0.0,
		  1.0, 1.0,
		  // Bottom face
		  1.0, 1.0,
		  0.0, 1.0,
		  0.0, 0.0,
		  1.0, 0.0,
		  // Front face
		  0.0, 0.0,
		  1.0, 0.0,
		  1.0, 1.0,
		  0.0, 1.0,
		  // Back face
		  1.0, 0.0,
		  1.0, 1.0,
		  0.0, 1.0,
		  0.0, 0.0,
		  // Right face
		  1.0, 0.0,
		  1.0, 1.0,
		  0.0, 1.0,
		  0.0, 0.0,
		  // Left face
		  0.0, 0.0,
		  1.0, 0.0,
		  1.0, 1.0,
		  0.0, 1.0
	];
	CubeVTB = GC.createBuffer();
	GC.bindBuffer(GC.ARRAY_BUFFER, CubeVTB);
	GC.bufferData(GC.ARRAY_BUFFER, new Float32Array(TextureCoords), GC.STATIC_DRAW);
	CubeVTB.ItemSize = 2;
	CubeVTB.NumItems=24;

	TextureTop = GC.createTexture();
	TextureTop.image= document.getElementById("imgTop");
	TextureTop.image.crossOrigin = "anonymous";
	TextureTop.image.onLoad = TextureLoaded(TextureTop);
	
	TextureSide = GC.createTexture();
	TextureSide.image= document.getElementById("imgSide");
	TextureSide.image.onLoad = TextureLoaded(TextureSide);
	TextureSide.image.crossOrigin = "anonymous";

	TextureBottom = GC.createTexture();
	TextureBottom.image= document.getElementById("imgBottom");
	TextureBottom.image.onLoad = TextureLoaded(TextureBottom);
	TextureBottom.image.crossOrigin = "anonymous";
}

var textcount=0;
function TextureLoaded(inpTexture){
	textcount++;
	GC.bindTexture(GC.TEXTURE_2D, inpTexture);
	GC.pixelStorei(GC.UNPACK_FLIP_Y_WEBGL, true);
	GC.texImage2D(GC.TEXTURE_2D, 0, GC.RGB, GC.RGB, GC.UNSIGNED_BYTE, inpTexture.image);
	GC.generateMipmap(GC.TEXTURE_2D);
	if (GC.INVALID_OPERATION == true) alert ("Invalid op");
	if (GC.INVALID_VALUE == true) alert ("Invalid value");
	if (GC.INVALID_ENUM == true) alert ("Invalid Enum");
	GC.texParameteri(GC.TEXTURE_2D, GC.TEXTURE_WRAP_S, GC.CLAMP_TO_EDGE); 
	GC.texParameteri(GC.TEXTURE_2D, GC.TEXTURE_WRAP_T, GC.CLAMP_TO_EDGE);
	GC.texParameteri(GC.TEXTURE_2D, GC.TEXTURE_MAG_FILTER, GC.LINEAR);
	GC.texParameteri(GC.TEXTURE_2D, GC.TEXTURE_MIN_FILTER, GC.LINEAR_MIPMAP_LINEAR);
	GC.bindTexture(GC.TEXTURE_2D, null);	
	if (textcount == 3) BindTextures();
}
var TexturesBound = false;
function BindTextures(){
	GC.activeTexture(GC.TEXTURE0);
	GC.bindTexture(GC.TEXTURE_2D, TextureTop);
	GC.activeTexture(GC.TEXTURE1);
	GC.bindTexture(GC.TEXTURE_2D, TextureBottom);
	GC.activeTexture(GC.TEXTURE2);
	GC.bindTexture(GC.TEXTURE_2D, TextureSide);
	TexturesBound = true;
}
