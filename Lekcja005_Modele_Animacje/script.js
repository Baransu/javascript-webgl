var lastTime = Date.now();;

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

var run = false;

var speed = 100;

var left = false, forward = false, right = false;

var normalMat;
var colMat;

function init()
{	
	scene = new THREE.Scene();

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
		map: THREE.ImageUtils.loadTexture("materials/grassD.bmp"),
		normalMap: THREE.ImageUtils.loadTexture("materials/grassN.bmp"),
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
			normalMap: THREE.ImageUtils.loadTexture ("materials/carmacN.png"),
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
		
		
		lights[0] = new THREE.PointLight(0x00ff00, 1);		
		lights[0].position.set(700, 250, 700);
		
		lights[1] = new THREE.PointLight(0x0000ff, 1);
		lights[1].position.set(-700, 250, -700);
		
		for(var i = 0; i < lights.length; i++)
			scene.add(lights[i]);
			
		meshModel.material.needsUpdate = true;
		ground.material.needsUpdate = true;
		
		meshModel.playAnimation(animations[1], 5);

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
		camera1.aspect = (WIDTH/2)/HEIGHT; // aspect powinien wynikać z proporcji polowy ekranu
		camera2.aspect = (WIDTH/2)/HEIGHT; // aspect powinien wynikać z proporcji polowy ekranu
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
	
	if(!left && !right && !forward)
	{
		run = false;
		meshModel.playAnimation(animations[0], 5);
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
	
	timer += deltaTime;
	
	if(timer > .1)
	{
		timer = 0;
		//changeColors();
	}
	
	//if(run)
	meshModel.updateAnimation(deltaTime * 1000);
		//meshModel.playAnimation(animations[1], 5);
	//else
		//meshModel.playAnimation(animations[0], 5);
	
	
	for(var i = 0; i < clones.length; i++)
	{
		if (clones[i].position.distanceTo(meshModel.position) < 20)
		{		              
			clones[i].material = colMat;
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
	
	
}

function onKeyUp(event)
{
	var e = event.which;
	
	//w
	if(e == 87) forward = false;
	
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
	if( !run && (e == 87 || e == 65 || e == 68))
	{
		run = true;
		meshModel.playAnimation(animations[1], 5);
	}

	//w
	if(e == 87) forward = true;
	
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
		if(radius < 1)
			radius = 1;	
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

	//obrot o 360 stopni
	if(angle > Math.PI * 2)	angle = 0;
	if(angle < 0) angle = Math.PI * 2;

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

function changeColors()
{
	
	if(functionColor)
	{
		lights[0].color.setHex(0xff0000);
		lights[1].color.setHex(0x0000ff);
	}
	else
	{
		lights[0].color.setHex(0x0000ff);
		lights[1].color.setHex(0xff0000);
	}
	
	functionColor = !functionColor;
	
	meshModel.material.needsUpdate = true;
	ground.material.needsUpdate = true;
}

