/* global THREE */
var lastTime = Date.now();
var start = Date.now();

var scene;
var camera1;
var camera2;
var renderer;

var WIDTH, HEIGHT;

var rot = 0.01;

var axis;

var camX = 0, camY = 50, camZ = 0;
var radius = 200;
var angle = Math.PI/2;

var origin = new THREE.Vector3(0,0,0);

var meshModel;
var animations = [];	
var cloneWave = 1;
var clones = [];

var lights = [];

var timer = 0;

var functionColor = true;

var ground;

var doubleCam = true;

var speed = 100;

var left = false, forward = false, right = false;

var normalMat;
var colMat;

var expMaterial;
var customMesh;

var globalLight = true;

var showUI = true;

var minorLights = [];
var minorLightsMeshes = [];

var ctx, canvas, CANVASH, CANVASW;

var lightSlider = {
	angle: 0,
	x: 0,
	y: 0,
	r: 10,	
}

var mouse = {
	x: 0,
	y: 0,
	rightPressed: false,
	leftPressed: false,	
}

var uiDiv;

var lightSliderPressed = false;

var crosshair = new Image();
crosshair.src = "materials/crosshair.png";

var lightRadius = 50;

function init()
{	
	uiDiv = document.getElementById("ui");
	//canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	canvas.height = canvas.width;
	
	CANVASW = canvas.width;
	CANVASH = canvas.width;		
	
	document.addEventListener('mousemove', function(e)
	{		
		mouse.x = e.clientX - uiDiv.offsetLeft; 
		mouse.y = e.clientY - uiDiv.offsetTop;

	}, false);

	document.addEventListener('mousedown', function(e)
	{
		switch (e.which)
		{
	        case 1:
	       		mouse.leftPressed = true;
	            break;
	        case 3:
	            mouse.rightPressed = true;
	            break;
	        default:
	            break;
    	}
	}, false);
	
	document.addEventListener('mouseup', function(e)
	{
		switch (e.which)
		{
	        case 1:
				mouse.leftPressed = false;
				lightSliderPressed = false;	
	            break;
	        case 3:
	            mouse.rightPressed = false;
	            break;
	        default:
	            break;
    	}
	}, false);
	
	canvas.addEventListener('click', function() { 
		
		if(mouse.x >= lightSlider.x - lightSlider.r && mouse.x <= lightSlider.x + lightSlider.r &&
		   mouse.y >= lightSlider.y - lightSlider.r && mouse.y <= lightSlider.y + lightSlider.r)
		{
			lightSliderPressed = true;
			console.log("pressed");
		}
		
	}, false);
	
	//console.log(canvas.style);
	
	//slidery	
	//document.getElementById('light' + this.name).addEventListener('mousedown', function (event) { lightControllers[indexo].clicked = true; }, false);
	//document.getElementById('light' + this.name).addEventListener('mouseup', function (event) { lightControllers[indexo].clicked = false; }, false);
	//document.getElementById('light' + this.name).addEventListener('mousemove', function (event) { lightControllers[indexo].move(event); }, false);	
		
	//three js	
	scene = new THREE.Scene();

	expMaterial =  new THREE.ShaderMaterial( {

		uniforms: { 
			tExplosion: { type: "t", value: THREE.ImageUtils.loadTexture('materials/gradient.png') },
			time: { type: "f", value: 0.0 },
			weight: { type: "f", value: 10.0 }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		
	} );	
   
	camera1 = new THREE.PerspectiveCamera(
	    60, // kąt patrzenia kamery (FOV - field of view)
	    16/9, // proporcje widoku
	    0.1, // min renderowana odległość
	    10000 // max renderowana odległość
    );
	
	camera2 = new THREE.PerspectiveCamera(
	    60, // kąt patrzenia kamery (FOV - field of view)
	    16/9, // proporcje widoku
	    0.1, // min renderowana odległość
	    10000 // max renderowana odległość
    );

    renderer = new THREE.WebGLRenderer();
	renderer.autoClear = false;
	
    // kolor tła 0x zamiast #
	renderer.setClearColor(0x000000);
	
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	renderer.setSize(WIDTH, HEIGHT);

	document.getElementById("div").appendChild(renderer.domElement);
	document.addEventListener("keydown", onKeyDown, false);
	document.addEventListener("keyup", onKeyUp, false);

	var geometry = new THREE.PlaneBufferGeometry(1024, 1024);
	//var mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture("materials/groundD.bmp") });
	
	var mat = new THREE.MeshPhongMaterial(
	{
		side: THREE.DoubleSide,
		map: THREE.ImageUtils.loadTexture("materials/groundD.bmp"),
		normalMap: THREE.ImageUtils.loadTexture("materials/groundN.bmp"),
		specular: 0xffffff,
		shininess: 2,
		shading: THREE.SmoothShading,
	});
		
	ground = new THREE.Mesh(geometry, mat);
	ground.material.map.repeat.set(16, 16); //gęstość powtarzania
	ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping; // powtarzanie w obu kierunkach	
	ground.material.normalMap.repeat.set(16, 16); //gęstość powtarzania
	ground.material.normalMap.wrapS = ground.material.normalMap.wrapT = THREE.RepeatWrapping; // powtarzanie w obu kierunkach	
	
	//ground.material.map.repeat.set(8, 8);
	//ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
	scene.add(ground);
	ground.rotation.x = Math.PI/2;
	
	
//	var mat = new THREE.MeshBasicMaterial(
//	{
//	     map: THREE.ImageUtils.loadTexture ("materials/carmac.png"),
//	     morphTargets: true, //konieczne do animacji
//	     morphNormals: true, //konieczne animacji
//	     specular: 0xffffff,
//	     shininess: 60,
//	     shading: THREE.SmoothShading,
//	     vertexColors: THREE.FaceColors
//	});

	camera1.position.x = camX;
	camera1.position.y = camY;
	camera1.position.z = camZ;

	camera1.lookAt(origin);
	
	camera2.position.x = 0;
	camera2.position.y = 50;
	camera2.position.z = -250;

	camera2.lookAt(origin);

	rotate(angle);

	var loader = new THREE.JSONLoader();
	
	loader.load('tris.js', function (geometry, mat)
	{
		geometry.computeMorphNormals();
		
		//mat.morphNormals = true;
		
		normalMat = new THREE.MeshPhongMaterial(
		{
			map: THREE.ImageUtils.loadTexture ("materials/carmac.png"),
			morphTargets: true,
			morphNormals: true,
			specular: 0xffffff,
			shininess: 1,
			shading: THREE.SmoothShading,
			vertexColors: THREE.FaceColors		
		});
		
		colMat = new THREE.MeshPhongMaterial(
		{
			wireframe: true,
			map: THREE.ImageUtils.loadTexture ("materials/carmac.png"),
			normalMap: THREE.ImageUtils.loadTexture ("materials/carmacN.png"),
			morphTargets: true,
			morphNormals: true,
			specular: 0xffffff,
			shininess: 1,
			shading: THREE.SmoothShading,
			vertexColors: THREE.FaceColors		
		});

		meshModel = new THREE.MorphAnimMesh(geometry, normalMat);
		meshModel.name = "name";
		meshModel.rotation.y = Math.PI; // ustaw obrót modelu
		meshModel.position.y = 25; // ustaw pozycje modelu
		meshModel.scale.set(1, 1, 1); // ustaw skalę modelu                   
		meshModel.parseAnimations();
		
		var element = document.getElementById("select");
		var id = 0;
		for (var key in meshModel.geometry.animations)
		{	
			if (key === 'length' || ! meshModel.geometry.animations.hasOwnProperty(key)) continue;
			animations.push(key);
			var temp = document.createElement("div");
			temp.className = "anim";
			temp.abc = id;
			temp.onmousedown = function(e)
			{
				change(e);
			};
			
			temp.innerHTML = key;
			element.appendChild(temp);
			id++;
		}
		
		
		lights[0] = new THREE.PointLight(0xffffff, 1);		
		lights[0].position.set(700, 250, 700);
		
		lights[1] = new THREE.PointLight(0xffffff, 1);
		lights[1].position.set(-700, 250, -700);
		
		for(var i = 0; i < lights.length; i++)
			scene.add(lights[i]);
			
		meshModel.material.needsUpdate = true;
		ground.material.needsUpdate = true;
		
		meshModel.playAnimation(animations[0], 5);

		scene.add(meshModel);

		loop();
	});
}

function loop()
{
    var now = Date.now();
    var deltaTime = (now - lastTime) / 1000.0;

    update(deltaTime);

    lastTime = now;

    window.requestAnimationFrame(loop);
	
	if(doubleCam)
	{
		//dobranie proporcji widoku
		camera1.aspect = (WIDTH/2)/HEIGHT;
		camera2.aspect = (WIDTH/2)/HEIGHT;
		camera1.updateProjectionMatrix();
		camera2.updateProjectionMatrix();
		// dla kamery 1
		renderer.setViewport(WIDTH/2,0,WIDTH/2,HEIGHT);
		renderer.render(scene, camera1);
		//dla kamery 2
		renderer.setViewport(0,0,WIDTH/2,HEIGHT);	
		renderer.render(scene, camera2);
	}
	else
	{
		camera1.aspect = WIDTH/HEIGHT;
		camera1.updateProjectionMatrix();
		renderer.setViewport(0,0,WIDTH,HEIGHT);
		renderer.render(scene, camera1);
	}
}

function update(deltaTime)
{
	
	console.log(CANVASW/2, CANVASH/2);
	console.log(mouse.x, mouse.y);
	expMaterial.uniforms[ 'time' ].value = .0001 * ( Date.now() - start );
//	customMesh.scale.x += deltaTime;
//	customMesh.scale.y += deltaTime;
//	customMesh.scale.z += deltaTime;
	
	if(forward)
	{
		meshModel.translateX(-speed * deltaTime);
	}
	
	//a
	if(left)
	{
		meshModel.rotation.y += Math.PI * deltaTime;
	}
	
	//d
	if(right)
	{
		meshModel.rotation.y -= Math.PI * deltaTime;
	}
		
	var camFPP = new THREE.Vector3(100, 45, 0);	
	var camPos = camFPP.applyMatrix4(meshModel.matrixWorld);
	            
	camera2.position.x = camPos.x;
	camera2.position.y = camPos.y;
	camera2.position.z = camPos.z;
	
	camera2.lookAt(meshModel.position);
	
	camera1.position.x = camX;
	camera1.position.z = camZ;
	camera1.position.y = camY;

	camera1.lookAt(origin);
	
	meshModel.updateAnimation(deltaTime * 1000);
	
	for(var i = 0; i < clones.length; i++)
	{
		if (clones[i].position.distanceTo(meshModel.position) < 20)
		{		              
			clones[i].material = expMaterial;
			clones[i].playAnimation(animations[0], 5);
			clones[i].playAnim = false;
		}
		else
		{
			clones[i].material = normalMat;
			clones[i].playAnim = true;
		}
		
		if(clones[i].playAnim)
			clones[i].updateAnimation(deltaTime * 1000);
	}
	
	if(lightSliderPressed)
	{
		lightSlider.angle = makeAngle(CANVASW/2, mouse.x, CANVASH/2, mouse.y);
	}
	
	updateMaterials();
	updateLightPos();
	
	drawCompas();
			
}

function makeAngle(x1,x2,y1,y2)
{
	return Math.atan2(y2 - y1,x2 - x1);	
}

function onKeyUp(event)
{
	var e = event.which;
	
	//w
	if(e == 87)
	{
		forward = false;
		meshModel.playAnimation(animations[0], 5);
	}	
	//run = false;
	//a
	if(e == 65) left = false;
	
	//d
	if(e == 68) right = false;
}

function onKeyDown(event)
{	
	if(event.which == 70) doubleCam = !doubleCam;
	
	//console.log(event.which)
	//up 38
	//down 40
	//left 37
	//right 39
	// + 187
	// - 189
	
	//w 87
	//a 65
	//s 83
	//d 68
	//q 69
	//e 81
	var e = event.which;
	
	//console.log(e);
	
	//l pressed 
	if(e == 76)
	{
		globalLight = !globalLight;
		light();
	}
	
	if(e == 77)
	{
		showUI = !showUI;
		ui();
	}
	
	//w
	if(e == 87)
	{
		forward = true;
		meshModel.playAnimation(animations[1], 5);
	}
	
	//a
	if(e == 65) left = true;
	
	//d
	if(e == 68) right = true;
	
	
	//c clone
	if(event.which == 67) clone();
	//x delete
	if(event.which == 88) deleteClone();
		
	//up
	if(event.which == 38)
		camY++;

	//down
	if(event.which == 40)
		camY--;

	//left cam
	if(event.which == 37)
	{
		angle += Math.PI/90;
		rotate(angle);
	}
	
	//close
	if(event.which == 189)
	{
		radius -= 5;
		if(radius < 1) radius = 1;	
		rotate(angle);	
	}
	
	//far
	if(event.which == 187)
	{
		radius += 5;
		rotate(angle);		
	}

	//right cam
	if(event.which == 39)
	{
		angle -= Math.PI/90;
		rotate(angle);		
	}

}

//funkcja obracajaca kamere wokol srodka
function rotate(angle)
{    
    camX = origin.x + Math.cos(angle) * radius;
	camZ = origin.z + Math.sin(angle) * radius;
}

function change(e)
{
	meshModel.playAnimation(animations[e.target.abc], 5);
	
	for(var i = 0; i < clones.length; i++)
	{
		clones[i].playAnimation(animations[e.target.abc], 5);
	}
}

function deleteClone()
{
	cloneWave = 0;
	for(var i = 0; i < clones.length; i++)
	{
		var c = clones[i];
		scene.remove(c);		
	}
	
	clones = [];
}

function clone()
{
	for(var i = 1; i <= 4 * cloneWave; i++)
	{
		var c = meshModel.clone();
		var angle = (Math.PI*2) / (cloneWave * 4);
		c.position.x = Math.cos(angle * i) * (cloneWave * 50);
		c.position.z = Math.sin(angle * i) * (cloneWave * 50);
		clones.push(c);
		scene.add(c);
		c.playAnimation(animations[0], 5);
	}
	
	cloneWave++;
}

function whichChild(e){
    var  i= 0;
    while((e = e.previousSibling) != null) ++i;
    return i;
}

function light()
{
	
	if(globalLight)
	{
		for(var i in lights)
		{
			lights[i].color.setHex(0xffffff);			
		}
	}
	else
	{
		for(var i in lights)
		{
			lights[i].color.setHex(0x000000);			
		}
	}		
}

function ui()
{
	var sel = document.getElementById("select");
	var ui = document.getElementById("ui");
	
	if(showUI)
	{
		ui.style.visibility = "visible";
		sel.style.visibility = "visible";
	}
	else
	{
		ui.style.visibility = "hidden";
		sel.style.visibility = "hidden";
	}
}

function drawCompas()
{	
	ctx.clearRect(0,0,CANVASW, CANVASH);
	
	//outer circle
	ctx.save();
	ctx.beginPath();
	ctx.arc(CANVASW/2, CANVASH/2, CANVASW/3, 0, 2 * Math.PI, false);
	ctx.strokeStyle = "white";
 	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
	
	//inner circle
	ctx.save();
	ctx.beginPath();
	ctx.arc(CANVASW/2, CANVASH/2, CANVASW/6, 0, 2 * Math.PI, false);
	ctx.strokeStyle = "white";
 	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
	
	//light slider
	ctx.save();
	ctx.beginPath();
	lightSlider.x = CANVASW/2 + Math.cos(lightSlider.angle) * CANVASW/6;
	lightSlider.y = CANVASH/2 + Math.sin(lightSlider.angle) * CANVASW/6;
	ctx.arc(lightSlider.x, lightSlider.y, lightSlider.r, 0, 2 * Math.PI, false);
	ctx.fillStyle = "yellow";
	ctx.fill();
	ctx.restore();
	
	//angles
	ctx.save();
	ctx.fillStyle = "white";
	ctx.font = "20px Arial";
	ctx.textAlign = "center";
	for(var i = 0; i < 8; i++)
	{
		var x = CANVASW/2 + Math.cos(Math.PI/4 * i) * CANVASW/4;
		var y = CANVASH/2 + Math.sin(Math.PI/4 * i) * CANVASW/4;
		ctx.fillText(45 * i, x, y + 10);
	}
	
	ctx.restore();	
	
	//directions
	ctx.save();
	ctx.translate(CANVASW/2,CANVASH/2);
	ctx.rotate(angle - Math.PI/2);
	ctx.fillStyle = "white";
	ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillText("N", 0, -CANVASH/2 + CANVASH/20 + 15);	
	ctx.fillText("S", 0, CANVASH/2 - CANVASH/20);		
	ctx.fillText("E", CANVASW/2 - CANVASW/20, 0);	
	ctx.fillText("W", -CANVASW/2 + CANVASW/20, 0);	
	ctx.restore();	
	
	
	//cursor
	ctx.save();
	ctx.drawImage(crosshair, mouse.x - 16, mouse.y - 16);
	ctx.restore();
}

function updateLightPos()
{
	if(minorLights.length > 0)
	{
		minorLights[minorLights.length - 1].position.x = Math.cos(lightSlider.angle) * lightRadius;
		minorLights[minorLights.length - 1].position.z = Math.sin(lightSlider.angle) * lightRadius;
	}
	
	if(minorLightsMeshes.length > 0)
	{
		minorLightsMeshes[minorLightsMeshes.length - 1].position.x = Math.cos(lightSlider.angle) * lightRadius;
		minorLightsMeshes[minorLightsMeshes.length - 1].position.z = Math.sin(lightSlider.angle) * lightRadius;
	}
}

function updateMaterials()
{
	meshModel.material.needsUpdate = true;
	ground.material.needsUpdate = true;
	
	for(var i in clones)
	{
		clones[i].material.needsUpdate = true;
	}
}

function addLight()
{
	var wireframeMat = new THREE.MeshBasicMaterial( { 
        color: 0x00ff00, 
        wireframe: true 
    } );
	
	var geometry = new THREE.SphereGeometry( 5, 5, 5 );
	var mesh = new THREE.Mesh(geometry, wireframeMat);
	mesh.position.set(lightRadius,50,0);
	
	var light = new THREE.PointLight(0x00ff00, 1);
	light.position.set(lightRadius, 50, 0);
	
	lightSlider.angle = 0;
	
	minorLightsMeshes.push(mesh);
	minorLights.push(light);
	scene.add(mesh);
	scene.add(light);	
	
}

// var lightControllers = [];
// 
// function LightController(name, max, indexo) {
// 	this.name = name;
// 	document.getElementById('light' + this.name).addEventListener('mousedown', function (event) { lightControllers[indexo].clicked = true; }, false);
// 	document.getElementById('light' + this.name).addEventListener('mouseup', function (event) { lightControllers[indexo].clicked = false; }, false);
// 	document.getElementById('light' + this.name).addEventListener('mousemove', function (event) { lightControllers[indexo].move(event); }, false);
// 	this.maxValue = max;
// 	this.clicked = false;
// 	this.value = (parseInt(document.getElementById('light' + this.name + 'Thumb').style.left) - 236) / 236 * this.maxValue + this.maxValue;
// 	this.move = function(e) {
// 		if(this.clicked) {
// 			var valu = e.clientX - document.getElementById('light' + this.name).getBoundingClientRect().left - 8;
// 			if(valu < 0) valu = 0;
// 			if(valu > 236) valu = 236;
// 			document.getElementById('light' + this.name + 'Thumb').style.left = valu;
// 			this.value = (parseInt(document.getElementById('light' + this.name + 'Thumb').style.left) - 236) / 236 * this.maxValue + this.maxValue;
// 		}
// 	};
// }
// 
// var names = ['R', 'G', 'B', 'X', 'Y', 'Z', 'P'];
// for(x in names) {
// 	lightControllers[x] = new LightController(names[x], 1, x);
// }