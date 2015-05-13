var lastTime = Date.now();;

var scene;
var camera;
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
var animationDeltaSum = 0;
var cloneWave = 1;
var clones = [];

function init()
{	
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
	    60, // kąt patrzenia kamery (FOV - field of view)
	    16/9, // proporcje widoku
	    0.1, // min renderowana odległość
	    10000 // max renderowana odległość
    );

    renderer = new THREE.WebGLRenderer();

    // kolor tła 0x zamiast #
	renderer.setClearColor(0x7EC0EE);

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	renderer.setSize(WIDTH, HEIGHT);

	document.getElementById("div").appendChild(renderer.domElement);
	document.addEventListener("keydown", onKeyDown, false);

	var geometry = new THREE.PlaneBufferGeometry(512, 512);
	var mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture("materials/mars.jpg") });
	var ground = new THREE.Mesh(geometry, mat);
	
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
	camera.position.x = camX;
	camera.position.y = camY;
	camera.position.z = camZ;

	camera.lookAt(origin);

	rotate(angle);
	
	var loader = new THREE.JSONLoader();
	
	loader.load('tris.js', function (geometry, mat)
	{
		geometry.computeMorphNormals();
		
		//mat.morphNormals = true;
		
		var mat = new THREE.MeshBasicMaterial(
		{
			map: THREE.ImageUtils.loadTexture ("materials/carmac.png"),
			morphTargets: true,
			morphNormals: true,
			specular: 0xffffff,
			shininess: 60,
			shading: THREE.SmoothShading,
			vertexColors: THREE.FaceColors		
		});

		meshModel = new THREE.MorphAnimMesh(geometry, mat);
		meshModel.name = "name";
		meshModel.rotation.y = Math.PI; // ustaw obrót modelu
		meshModel.position.y = 25; // ustaw pozycje modelu
		meshModel.scale.set(1, 1, 1); // ustaw skalę modelu                   
		meshModel.parseAnimations();
		
		var element = document.getElementById("select");
		console.log(element);
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
			console.log(key);
			id++;
		}
		
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
    renderer.render(scene, camera);
}

function update(deltaTime)
{
	camera.position.x = camX;
	camera.position.z = camZ;
	camera.position.y = camY;

	camera.lookAt(origin);
	animationDeltaSum += deltaTime;
	
	meshModel.updateAnimation(animationDeltaSum);
	
	for(var i = 0; i < clones.length; i++)
	{
		clones[i].updateAnimation(animationDeltaSum);
	}
}

function onKeyDown(event)
{	
	//console.log(event.which);
	if(event.which == 67)
	{
		clone();
	}
	//87 up
	if(event.which == 87)
		camY++;

	//83 down
	if(event.which == 83)
		camY--;

	//87 up
	if(event.which == 87)
		camY++;

	//83 down
	if(event.which == 83)
		camY--;

	//65 left
	if(event.which == 65)
	{
		angle += Math.PI/180;
		rotate(angle);
	}

	//68 right 
	if(event.which == 68)
	{
		angle -= Math.PI/180;
		rotate(angle);		
	}

	//obrot o 360 stopni
	if(angle > Math.PI * 2)
		angle = 0
	if(angle < 0)
		angle = Math.PI * 2;

	//console.log(event.which);

	//81 close
	if(event.which == 81)
	{
		radius--;
		if(radius < 1)
			radius = 1;	
		rotate(angle);	
	}
	//69 far
	if(event.which == 69)
	{
		radius++;
		if(radius > 400)
			radius = 400;
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
	console.log(e.target.abc)
}

function clone()
{
	for(var i = 1; i <= 4 * cloneWave; i++)
	{
		var c = meshModel.clone();
		c.position.x = Math.cos((Math.PI * 2) / (i)) * (cloneWave * 50);
		c.position.z = Math.sin((Math.PI * 2) / (i)) * (cloneWave * 50);
		clones.push(c);
		scene.add(c);
		c.playAnimation(animations[0], 5);
	}
	cloneWave++;

//kontener.remove(obiekt_klona_zapisany_w_tablicy_klonow);	
}

function whichChild(elem){
    var  i= 0;
    while((elem = elem.previousSibling) != null) ++i;
    return i;
}

