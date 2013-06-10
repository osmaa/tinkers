params = [
	{ "id": "teeth", "displayName": "Number of teeth", 
	  "type": "int", "default": 14, 
	  "rangeMin": 12, "rangeMax": 256 
	},
    { "id": "module", "displayName": "Module: teeth/mm", 
	  "type": "float", "default": 1, 
	  "rangeMin": 0.5, "rangeMax": 3 
	},
    { "id": "pressureAngle", "displayName": "Pressure angle: 14.5, 20, 25", 
	  "type": "float", "default": 20, 
	  "rangeMin": 14.5, "rangeMax": 25
	}
]

/*
  Draw an involute spur gear using the metric Module parameters
  The gear will be of 1mm face width, to be scaled by designer
  No axis or hole is provided, add one into the design as needed
*/
function process(params) {
	// additional standard gear parameters
	var pitchDiameter = params.module * params.teeth;
	var addendum = params.module;
	var dedendum = params.module * (1 + Math.PI/20);

	// radiuses of the circles:
	var outerRadius = pitchDiameter/2 + addendum;
	var baseRadius = pitchDiameter/2 * Math.cos(Math.PI * params.pressureAngle / 180);
	var rootRadius = pitchDiameter/2 - dedendum;

	//Debug.log("working depth is "+addendum*2+", outer diameter is "+outerRadius*2);

	// build the root circle  
	var gear = new Path2D();
	gear.moveTo(rootRadius,0);
	var toothAngle = 2 * Math.PI / params.teeth;
	for(var i = 0; i <= params.teeth; i++)
	{
		var angle = i * toothAngle + toothAngle/4;
		var tooth = involuteTooth(gear, rootRadius, baseRadius, outerRadius, toothAngle, i);
		var xr = rootRadius * Math.cos(angle);
		var yr = rootRadius * Math.sin(angle);
		var xo = outerRadius * Math.cos(angle);
		var yo = outerRadius * Math.sin(angle);
		Debug.line( [xr,yr,0], [xo,yo,0] );
	}
	gear.close();
		
	var solid = Solid.extrude( [gear], 1 );
	return solid;
}


/*
  create an involute curve for the tooth profile
  Algorithm based on:
	http://arc.id.au/GearDrawing.html
*/
function involuteTooth(tooth, rootRadius, baseRadius, outerRadius, toothAngle, n) {
	// maximum angle for theta
	var angle = Math.sqrt(outerRadius*outerRadius - baseRadius*baseRadius) / baseRadius;
	// angle of this tooth
	var pitchAngle = n * toothAngle;
	var resolution = Tess.circleDivisions(outerRadius - baseRadius);
	//var tooth = new Path2D();

	// smooth curve from the gear floor
	var xr = rootRadius * Math.cos(pitchAngle - toothAngle / 4);
	var yr = rootRadius * Math.sin(pitchAngle - toothAngle / 4);
	tooth.lineTo(xr, yr);
	var xb = baseRadius * Math.cos(pitchAngle + 0);
	var yb = baseRadius * Math.sin(pitchAngle + 0);
	var xc = rootRadius * Math.cos(pitchAngle + 0);
	var yc = rootRadius * Math.sin(pitchAngle + 0);
	tooth.bezierCurveTo(xc, yc, xc, yc, xb, yb);

	// right face of the tooth
	for (var i=0; i <= resolution; i++) {
		var theta = angle * i / resolution;
		var xb = baseRadius * Math.cos(pitchAngle + theta);
		var yb = baseRadius * Math.sin(pitchAngle + theta);
		var involute = baseRadius * theta;
		var x = xb + involute * Math.sin(pitchAngle + theta);
		var y = yb - involute * Math.cos(pitchAngle + theta);
		tooth.lineTo(x, y);
		//Debug.line( [xb, yb, 0], [x,y,0] );
	}
	// left face of the tooth
	for (var i=resolution; i >= 0; i--) {
		var theta = - angle * i / resolution;
		var xb = baseRadius * Math.cos(pitchAngle + toothAngle/2 + theta);
		var yb = baseRadius * Math.sin(pitchAngle + toothAngle/2 + theta);
		var involute = baseRadius * theta;
		var x = xb + involute * Math.sin(pitchAngle + toothAngle/2 + theta);
		var y = yb - involute * Math.cos(pitchAngle + toothAngle/2 + theta);
		tooth.lineTo(x, y);
		//Debug.line( [xb, yb, 0], [x,y,0] );
	}
	
	// smooth curve to the gear floor
	var xr = rootRadius * Math.cos(pitchAngle + toothAngle * 3/4);
	var yr = rootRadius * Math.sin(pitchAngle + toothAngle * 3/4);
	var xc = rootRadius * Math.cos(pitchAngle + toothAngle * 2/4);
	var yc = rootRadius * Math.sin(pitchAngle + toothAngle * 2/4);
	tooth.bezierCurveTo(xc, yc, xc, yc, xr, yr);

	//tooth.close();
	return tooth;
}
