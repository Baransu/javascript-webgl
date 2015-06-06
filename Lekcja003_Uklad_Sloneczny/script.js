var lastTime;

var scene;
var camera;
var renderer;

var WIDTH, HEIGHT;

var rot = 0.01;

var axis;

var camX = 0, camY = 50, camZ = 0;
var radius = 200;
var angle = Math.PI/2;

var solarObjects = [];

var origin;
var edit = false;

var intersects;

var rotationInterval;

var rotationMod = new THREE.Object3D();
var cameraHandler = new THREE.Object3D();

var currentPlanet = 0;

var solarData = [
	//sun
	{radius: 10.93, materialLink: "sun.jpg", position: new THREE.Vector3(0,0,0), orbitaRot: 0, selfRot: 0.001, name: "sun"},
	
	//markury
	{radius: 0.383, materialLink: "mercury.jpg", position: new THREE.Vector3(50,0,0), orbitaRot: 0.00101, selfRot: 0.01, name: "mercury"},
	//venus
	{radius: 0.950, materialLink: "venus.jpg", position: new THREE.Vector3(60,0,0), orbitaRot: 0.001, selfRot: 0.01, name: "venus"},
	//earth
	{radius: 1, materialLink: "earth.jpg", position: new THREE.Vector3(75,0,0), orbitaRot: 0.00045, selfRot: 0.01, name: "earth"},
	//mars
	{radius: 0.532, materialLink: "mars.jpg", position: new THREE.Vector3(120,0,0), orbitaRot: 0.0031, selfRot: 0.01, name: "mars"},
	//jowisz
	{radius: 10.97, materialLink: "jupiter.jpg", position: new THREE.Vector3(155,0,0), orbitaRot: 0.00501, selfRot: 0.01, name: "jupiter"},
	//saturn
	{radius: 9.14, materialLink: "saturn.jpg", position: new THREE.Vector3(200,0,0), orbitaRot: 0.003301, selfRot: 0.01, name: "saturn"},
	//uran
	{radius: 3.98, materialLink: "uranus.png", position: new THREE.Vector3(255,0,0), orbitaRot: 0.003201, selfRot: 0.01, name: "uranus"},
	//neptun
	{radius: 3.86, materialLink: "neptun.jpg", position: new THREE.Vector3(300,0,0), orbitaRot: 0.00201, selfRot: 0.01, name: "neptun"},
]

var orbity = [];

function init(){	
	
	scene = new THREE.Scene();

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	
	camera = new THREE.PerspectiveCamera(
	    60, // kąt patrzenia kamery (FOV - field of view)
	    WIDTH/HEIGHT, // proporcje widoku
	    0.1, // min renderowana odległość
	    10000 // max renderowana odległość
    );

    renderer = new THREE.WebGLRenderer();

    // kolor tła 0x zamiast #
	renderer.setClearColor(0x000000);

	renderer.setSize(WIDTH, HEIGHT);

	document.getElementById("div").appendChild(renderer.domElement);
	document.addEventListener("keydown", onKeyDown, false);

	var geometry = new THREE.SphereGeometry(1000, 64,64);
	var mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,map: THREE.ImageUtils.loadTexture("materials/skybox.jpg") });
	

	var skybox = new THREE.Mesh(geometry, mat)

	var light = new THREE.PointLight( 0xffffff, 1, 0 );
	light.position.set( 0, 0, 0 );
	
	for(var a = 0; a < solarData.length; a++){
		if(a == 0)
			var material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,map: THREE.ImageUtils.loadTexture("materials/"+ solarData[a].materialLink +"") });
		else
			var material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide,map: THREE.ImageUtils.loadTexture("materials/"+ solarData[a].materialLink +"") });
			
		var geometry = new THREE.SphereGeometry(solarData[a].radius, 32, 32)
		var mesh = new THREE.Mesh(geometry, material)
		mesh.position.set(solarData[a].position.x, solarData[a].position.y, solarData[a].position.z);
		solarObjects.push(mesh);
	}

	for(var a = 0; a < solarObjects.length; a++){
		orbity.push(new THREE.Object3D());
	}

	for(var a = 0; a < orbity.length; a++){
		orbity[a].add(solarObjects[a]);
		scene.add(orbity[a]);
	}

	for(var a = 0; a < orbity.length; a++){

		var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
		var geometry = new THREE.Geometry();

		for(var b = 0; b <= 180; b++){
			var pi = (2*Math.PI)/180 * b;
			geometry.vertices.push(rotateForOrbita(pi, solarData[a].position.x));
		}           

		var line = new THREE.Line(geometry, lineMaterial);
		scene.add(line);
	}
	scene.add(skybox);
	scene.add( light );
	camera.position.x = camX;
	camera.position.y = camY;
	camera.position.z = camZ;

	//camera.lookAt(origin);
	
	var element = document.getElementById("select");
	for(var i in solarData)
	{
		var temp = document.createElement("div");
		temp.className = "solar";
		temp.abc = i;
		temp.onmousedown = function(e)
		{
			change(e);
		};
		
		temp.innerHTML = solarData[i].name;
		element.appendChild(temp);
	}
	
	// /cameraHandler.add(camera);
	
	//console.log(scene.children[5].position.x)
	loop();

}

function loop() {
    var now = Date.now();
    var deltaTime = (now - lastTime) / 1000.0;

    update(deltaTime);

    lastTime = now;

    window.requestAnimationFrame(loop);
    renderer.render(scene, camera);

};

function update(deltaTime){
	
	origin = new THREE.Vector3().setFromMatrixPosition(solarObjects[currentPlanet].matrixWorld)
	
	camera.position.x = camX;
	camera.position.y =	camY;
	camera.position.z = camZ;
	camera.lookAt(origin);


	for(var a = 0; a < orbity.length; a++){
		orbity[a].rotation.y += solarData[a].orbitaRot;
		solarObjects[a].rotation.y += solarData[a].selfRot;
	}
	
	rotate(angle);
};

function onKeyDown(event){	
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
	if(event.which == 65){
		angle += Math.PI/180;
	}

	//68 right 
	if(event.which == 68){
		angle -= Math.PI/180;	
	}

	//obrot o 360 stopni
	if(angle > Math.PI * 2)
		angle = 0;
	if(angle < 0)
		angle = Math.PI * 2;

	//console.log(event.which);

	//81 close
	if(event.which == 81){
		radius--;
		if(radius < 1)
			radius = 1;		
	}
	//69 far
	if(event.which == 69){
		radius++;
		if(radius > 400)
			radius = 400;		
	}
};

//funkcja obracajaca kamere wokol srodka
function rotate(angle)
{    
	camX = origin.x + Math.cos(angle) * radius;
	camZ = origin.z + Math.sin(angle) * radius;
};

function rotateForOrbita(angle1, radius1){    
    var x = Math.cos(angle1) * radius1;
	var z = Math.sin(angle1) * radius1;
	return new THREE.Vector3(x, 0, z);
};

function change(e)
{	
	currentPlanet = e.target.abc;
}
