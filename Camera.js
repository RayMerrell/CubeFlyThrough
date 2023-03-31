
function objCamera(){
	this.ViewDirection = vec3.fromValues(0,0,-1); //into screen, Z-Axis
	this.Velocity = vec3.fromValues(0,0,0); //zero
	this.Position = vec3.fromValues(0,0,15); // out of screen 15 on z axis
	this.Up = vec3.fromValues(0,1,0);//Y-axis
	   
	this.MaxSpeed = 0.25;
	this.AccelRate = 0.0025;
	this.RollRate = 5;

	this.Speed = 0;
	
	this.Move = function(){
		vec3.normalize(this.ViewDirection,this.ViewDirection);
		vec3.scale(this.Velocity, this.ViewDirection, this.Speed);
		this.Position = vec3.add(this.Position, this.Position, this.Velocity);
	}
	
	this.RotateAroundVector =function(AxisOfRotation, Angle, RotatedVector){
		var a =[];
		var CA = Math.cos(Angle);
		vec3.scale(a, RotatedVector, CA);
		var Dot = vec3.dot (AxisOfRotation, RotatedVector);
		tmp = Dot * (1 - CA );
		var b = [];
		vec3.scale(b, AxisOfRotation, tmp);
		var Cross=[];
		vec3.cross(Cross, AxisOfRotation, RotatedVector);
		var SA= Math.sin(Angle);
		var c = [];
		vec3.scale (c, Cross, SA);
		var d = [];
		vec3.add(d, a, b);
		vec3.add(a, c, d);
		return a;
	}
	
	this.Accelerate = function(){
		if (this.Speed != 0){
			this.Speed = Math.min(this.MaxSpeed,this.Speed + this.AccelRate);
		}else{
			this.Speed = 0.05;
		}
	}
	
	this.Decelerate = function(){
		/*if (this.Speed > 0){
			this.Speed = Math.max(0, this.Speed - (this.Speed * (this.AccelRate - 1 )));
		}else{
			this.Speed = 0;
		}
		if (this.Speed <= 0.05) this.Speed = 0;*/
		this.Speed = Math.max(-this.MaxSpeed,this.Speed - this.AccelRate);
	}
	
	this.Yaw = function(){
		if (booPointerLockable == true){
			var DeltaX = MovementX;
		}else{
			var DeltaX = (NewX - OldX);
			OldX = NewX;
		}
		if (DeltaX > 100) return;
		DeltaX = degToRad(DeltaX / 5);
		this.ViewDirection = this.RotateAroundVector(this.Up, -DeltaX, this.ViewDirection);
	}
	
	this.Pitch = function(){
		if (booPointerLockable == true){
			var DeltaY = MovementY;
		}else{
			var DeltaY = (NewY - OldY);
			OldY = NewY;
		}
			if (DeltaY > 100) return;
		DeltaY = degToRad(DeltaY / 5);
		var RotVect = vec3.create();
		vec3.cross (RotVect ,this.ViewDirection, this.Up) ;	
		this.ViewDirection = this.RotateAroundVector(RotVect, -DeltaY, this.ViewDirection);
		this.Up = this.RotateAroundVector (RotVect, -DeltaY, this.Up);
	}
	
	this.Roll = function(){
		if (booADown == true){
			this.Up = this.RotateAroundVector (this.ViewDirection, degToRad(-this.RollRate), this.Up);
		}else{
			this.Up = this.RotateAroundVector (this.ViewDirection, degToRad(this.RollRate), this.Up);
		}
	}
	
	this.PositionCamera = function(){
		if (booFly === true){
			if (booWDown == true) this.Accelerate();
			if (booSDown == true) this.Decelerate();
			if (booADown == true) this.Roll();
			if (booDDown == true) this.Roll();
			if (booMouseMove == true){
				this.Pitch();
				this.Yaw();
				booMouseMove = false;
			}
			this.Move();
		}
	}
	
	this.GetCameraMatrix = function(){
		this.PositionCamera();
		var Target = vec3.create();
		var matPosition = mat4.create();
		//generate the lookat point by adding the position to the (normalised) view direction
		vec3.add(Target, this.Position, this.ViewDirection);
		//out, position, target, up
		return mat4.lookAt(matPosition, this.Position, Target, this.Up);
	}	
}
