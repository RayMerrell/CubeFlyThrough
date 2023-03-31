var Canvas;
var GC;
var Camera;

var LastMouseX = 0;
var LastMouseY = 0;

var booWDown = false;
var booSDown = false;
var booADown = false;
var booDDown = false;
var booQDown = false;
var booEDown = false;
var booMouseMove = false;
var booPointerLockable = false;
var MovementX;
var MovementY;

var OldX = -1;
var OldY = -1;
var NewX = 0;
var NewY = 0;

var booFly = false; //switch to false for release
var booHeadTurned = false;

var CubeArray = [];
var CubeNum = 5;
var shaderProgram;
var ProgramArray = [];

var LastTime = 0;
var DLightX = 100;
var DLightY = 100;
var DLightZ = 0;
var DLightR = 1;
var DLightG = 1;
var DLightB = 0;
var ALightI = 1;
var ALightR = 0;
var ALightG = 0;
var ALightB = 0;
/*declare and create the projection and model view Matrix using third party Matrix code */
var matProjection = mat4.create();
var matCameraPosition = mat4.create();


function SetFly(){
	booFly = true;
	//todo expand control panel shrink canvas
}
function ResetFly(){
	booFly = false;
	//todo shrink control panel expand canvas
}

function SetProjection(Program){
	mat4.perspective(matProjection, 45, GC.ViewportWidth/GC.ViewportHeight, 0.1, 100);
	GC.uniformMatrix4fv(Program.UmatProjection, false, matProjection);
}
function SetCamera(Program){
	GC.uniformMatrix4fv(Program.UmatCameraPosition, false, Camera.GetCameraMatrix());
}
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
function InitGC(){
	try{
		GC = Canvas.getContext("experimental-webgl");
		GC.ViewportWidth = Canvas.clientWidth;
		GC.ViewportHeight = Canvas.clientHeight;
		GC.viewport(0,0,GC.ViewportWidth, GC.ViewportHeight);
		GC.clearColor (0.0, 0.0,0.0,1.0);
		GC.enable(GC.DEPTH_TEST);
		GC.enable(GC.CULL_FACE);
		mat4.identity (matProjection);
		mat4.identity (matCameraPosition);
		//pointer lock and mousemovement
		Canvas.requestPointerLock = Canvas.requestPointerLock || Canvas.mozRequestPointerLock || Canvas.webkitRequestPointerLock;
		Canvas.onclick = function(){ Canvas.requestPointerLock(); booFly=true;};
		if ("onpointerlockchange" in document) {
			document.addEventListener('pointerlockchange', lockChangeAlert, false);
			booPointerLockable = true;
		} else if ("onmozpointerlockchange" in document) {
			document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
			booPointerLockable = true;
		} else if ("onwebkitpointerlockchange" in document) {
			document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
			booPointerLockable = true;
		}
		document.onmousemove = MouseMove;
	}catch(e){
		alert ("Graphics Context Creation error " + e.message)
	}
}
function lockChangeAlert() {
	if(document.pointerLockElement === Canvas || document.mozPointerLockElement === Canvas || document.webkitPointerLockElement === Canvas) {
		console.log('The pointer lock status is now locked');
		booFly = true;
	} else {
		console.log('The pointer lock status is now unlocked');      
		booFly = false;
	}
}

function InitShaders(){
	/*create a fragment and vertex shader*/
	var fragmentShader = getShader(GC, "standard-shader-fs");
	var vertexShader = getShader (GC, "standard-shader-vs");
	
	/*create a program*/
	shaderProgram = GC.createProgram();
	/*attach our shaders */
	GC.attachShader(shaderProgram, vertexShader);
	GC.attachShader(shaderProgram, fragmentShader);
	/*link the program to the card?*/
	GC.linkProgram (shaderProgram);
	/*error checking*/
	if (!GC.getProgramParameter(shaderProgram, GC.LINK_STATUS)){
		alert("Could not initialise shaders");
	}
	/*now tell the card to use this program when drawing next?*/
	GC.useProgram(shaderProgram);
	//get a handle on the attributes
	shaderProgram.VertexPositionAttribute = GC.getAttribLocation (shaderProgram, "attVertexPosition");
	GC.enableVertexAttribArray(shaderProgram.VertexPositionAttribute);
	shaderProgram.TextureCoordAttribute = GC.getAttribLocation(shaderProgram, "attTextureCoord");
	GC.enableVertexAttribArray(shaderProgram.TextureCoordAttribute);
	shaderProgram.VertexNormalAttribute = GC.getAttribLocation(shaderProgram, "attVertexNormal");
	GC.enableVertexAttribArray(shaderProgram.VertexNormalAttribute);
	
	//get a handle on the uniforms
	shaderProgram.UmatProjection = GC.getUniformLocation(shaderProgram, "UmatProjection");
	shaderProgram.UmatCameraPosition = GC.getUniformLocation(shaderProgram, "UmatCameraPosition");
	shaderProgram.UmatModelView = GC.getUniformLocation(shaderProgram, "UmatModelView");
	shaderProgram.USampler = GC.getUniformLocation(shaderProgram, "USampler");
	shaderProgram.UmatNormal = GC.getUniformLocation(shaderProgram, "UmatNormal");	
	shaderProgram.UAmbientColour = GC.getUniformLocation(shaderProgram, "UAmbientColour");
	shaderProgram.ULightLocation = GC.getUniformLocation(shaderProgram, "ULightLocation");
	shaderProgram.UDirectionalColour = GC.getUniformLocation(shaderProgram, "UDirectionalColour");
	shaderProgram.UUseLights = GC.getUniformLocation(shaderProgram, "UUseLights");
	shaderProgram.UPointLightLocation = GC.getUniformLocation(shaderProgram, "UPointLightLocation");
	shaderProgram.UPointLightColour = GC.getUniformLocation(shaderProgram, "UPointLightColour");
	shaderProgram.UPointLightStrength = GC.getUniformLocation(shaderProgram, "UPointLightStrength");
	//find a better place to set point lighting please 
	var LightLoc = vec3.fromValues (-4,0,2);
	var LightColour = vec3.fromValues(1,0,0);
	GC.uniform3f(shaderProgram.UPointLightLocation, LightLoc[0],LightLoc[1],LightLoc[2]);
	GC.uniform3f(shaderProgram.UPointLightColour, LightColour[0],LightColour[1],LightColour[2]);
	GC.uniform1f(shaderProgram.UPointLightStrength, 500.0);
	/*var LightLocation = [parseFloat(DLightX), parseFloat(DLightY), parseFloat(DLightZ) ];		
	var AdjustedLL = vec3.create();
	vec3.normalize (AdjustedLD, LightLocation);
	vec3.scale (AdjustedLD, AdjustedLD, -1);*/
	GC.uniform3f(shaderProgram.ULightLocation, parseFloat(DLightX), parseFloat(DLightY), parseFloat(DLightZ));
	//GC.uniform3f(shaderProgram.ULightLocation, parseFloat(AdjustedLD[0]),parseFloat(AdjustedLD[1]),parseFloat(AdjustedLD[2]));
	GC.uniform3f(shaderProgram.UDirectionalColour, DLightR, DLightG, DLightB);
	//set defualt shader program
	ProgramArray[0] = shaderProgram;
	
}

function getShader(gl, id){
	/* find the scripts */
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		alert ("No shader Script loaded");
		return null;
	}
	/*stick the scripts into a string */
	var str ="";
	var k = shaderScript.firstChild;	
	while (k) {
		if (k.nodeType == 3){
			str+= k.textContent;
		}
		k = k.nextSibling;
	}
	/* create the appropriate type of shader */
	var shader;
	if (shaderScript.type == "x-shader/x-fragment"){
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if  (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader (gl.VERTEX_SHADER);
	} else {
		alert ("No shader script created");
		return null;
	}
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert ("Shaders porked " + gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}
function ResetCubeRot(){
	for (var o = 0; o < CubeArray.length; o++){
		CubeArray[o].ResetRot();	
	}
	
}

function ResetCubeOsc(){
	for (var o = 0; o < CubeArray.length; o++){
		CubeArray[o].ResetOsc();	
	}
}

function InitCubeArray(){
	var Total = document.getElementById("numCubes").value;
	for (var i = 0; i < Total; i++){
		AddCube();
	}
	document.getElementById("numCubes").value = CubeArray.length;
}

function ResetCubeCreation(){
	for (var o = 0; o < CubeArray.length; o++){
		CubeArray[o]=null;
	}
	CubeArray=[];
	InitCubeArray();
	document.getElementById("numCubes").value = CubeArray.length;
}

function DelCube(){
	var l = CubeArray.length-1;
	CubeArray[l]= null;
	CubeArray.pop();
	document.getElementById("numCubes").value = CubeArray.length;
}

function AddCube(){
	var Pos = vec3.create();
	var Size = Math.random();
	var Energy = Math.random();
	var index = CubeArray.length;
	vec3.set(Pos,Math.sin(Math.random()*10)*15, (Math.cos(Math.random()*10)*15) +2, (Math.sin(Math.random()*4))-5);
	//               size, position, energy, shader program
	var NewCube = new objCube(Size, Pos, Energy, ProgramArray[0]);
	CubeArray.push(NewCube);
	document.getElementById("numCubes").value = CubeArray.length;
}
function Animate(){
	window.requestAnimationFrame(Animate);
	GC.clear(GC.COLOR_BUFFER_BIT | GC.DEPTH_BUFFER_BIT);
	SetCamera(ProgramArray[0]);
	if (TexturesBound){
		for (var o = 0; o < CubeArray.length; o++){
			GetLightValues();
			CubeArray[o].Animate();
			CubeArray[o].Draw(ProgramArray[0]);		
		}
	}
}


function StartGraphics() {
	Canvas = document.getElementById("TestCanvas");	
	InitGC();
	InnitCubeTextures();
	InitShaders();
	InnitCubeBuffers(ProgramArray[0]);
	InitCubeArray();
	Camera = new objCamera();	
	document.onkeydown = KeyDown;
    document.onkeyup = KeyUp;
	SetProjection(ProgramArray[0]);
	Animate();
}

function ResizeCanvas(){
	Canvas.width = window.innerWidth;
	Canvas.height = window.innerHeight - 163;
	Canvas.clientLeft=0;
	Canvas.clientTop=0;
	GC.ViewportWidth = Canvas.width;
	GC.ViewportHeight = Canvas.height;
	GC.viewport(0, 0, Canvas.width, Canvas.height);
	mat4.perspective(matProjection, 45, GC.ViewportWidth/GC.ViewportHeight, 0.1, 100);
	GC.uniformMatrix4fv(shaderProgram.UmatProjection, false, matProjection);
}

function MouseMove(event){
	if (booPointerLockable == true){
		  MovementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		  MovementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
	}else{
		NewX = event.clientX;
		NewY = event.clientY;
	}
	booMouseMove = true;
}

function KeyDown(event) {
	if (String.fromCharCode(event.keyCode) == "w" || String.fromCharCode(event.keyCode) == "W") {
		//move camera forwards
		booWDown = true;
	}
	if (String.fromCharCode(event.keyCode) == "s" || String.fromCharCode(event.keyCode) == "S") {
		//move camera backwards
		booSDown = true;
	}
	if (String.fromCharCode(event.keyCode) == "a" || String.fromCharCode(event.keyCode) == "A") {
		//rotate camera anticw
		booADown = true;
	}
	if (String.fromCharCode(event.keyCode) == "d" || String.fromCharCode(event.keyCode) == "D") {
		//rotate camera cw
		booDDown = true;
	}
	if (String.fromCharCode(event.keyCode) == "e" || String.fromCharCode(event.keyCode) == "E") {
		//rotate 90 right
		booEDown = true;
		booHeadTurned = true;
	}
	if (String.fromCharCode(event.keyCode) == "q" || String.fromCharCode(event.keyCode) == "Q") {
		//rotate 90 left
		booQDown = true;
		booHeadTurned = true;
	}
	if (String.fromCharCode(event.keyCode) == "ESC") {
		//Stop flying
		booFly = false;
	}
	if (String.fromCharCode(event.keyCode) == " ") {
		//Stop
		Camera.Speed = 0;
	}
}

function KeyUp(event) {
	if (String.fromCharCode(event.keyCode) == "w" || String.fromCharCode(event.keyCode) == "W") {
		//move camera forwards
		booWDown = false;
	}
	if (String.fromCharCode(event.keyCode) == "s" || String.fromCharCode(event.keyCode) == "S") {
		//move camera backwards
		booSDown = false;
	}
	if (String.fromCharCode(event.keyCode) == "a" || String.fromCharCode(event.keyCode) == "A") {
		//rotate camera anticw
		booADown = false;
	}
	if (String.fromCharCode(event.keyCode) == "d" || String.fromCharCode(event.keyCode) == "D") {
		//rotate camera cw
		booDDown = false;
	}
	if (String.fromCharCode(event.keyCode) == "e" || String.fromCharCode(event.keyCode) == "E") {
		//rotate 90 right
		booEDown = false;
	}
	if (String.fromCharCode(event.keyCode) == "q" || String.fromCharCode(event.keyCode) == "Q") {
		//rotate 90 left
		booQDown = false;
	}
 }
GetLightValues = function(){
	DLightX = document.getElementById("inpDirLightX").value;
	DLightY = document.getElementById("inpDirLightY").value;
	DLightZ = document.getElementById("inpDirLightZ").value;
	DLightR = document.getElementById("inpDirLightRed").value;
	DLightG = document.getElementById("inpDirLightGreen").value;
	DLightB = document.getElementById("inpDirLightBlue").value;
	ALightI = 1;
	ALightR = document.getElementById("inpAmbLightRed").value;
	ALightG = document.getElementById("inpAmbLightGreen").value;
	ALightB = document.getElementById("inpAmbLightBlue").value;
}