var lastTime;

var scene;
var camera;
var renderer;

var WIDTH, HEIGHT;

var rot = 0.01;

var axis;

var camX = -10, camY = 5, camZ = 10;
var radius = 10;
var angle = Math.PI/2;

var objects = [];

var origin = new THREE.Vector3(0,0,0);
var edit = false;

var intersects;

var rotationInterval;

function init(){	
	
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
	    60, // kąt patrzenia kamery (FOV - field of view)
	    16/9, // proporcje widoku
	    0.1, // min renderowana odległość
	    10000 // max renderowana odległość
    );

    renderer = new THREE.WebGLRenderer();

    // kolor tła 0x zamiast #
	renderer.setClearColor(0x000000);

	WIDTH = 800//window.innerWidth;
	HEIGHT = 400//window.innerHeight;

	renderer.setSize(WIDTH, HEIGHT);

	document.getElementById("div").appendChild(renderer.domElement);
	document.addEventListener("keydown", onKeyDown, false);


	document.addEventListener("mousedown", onMouseDown, false);

	var geometry = new THREE.BoxGeometry(1,1,1, 32,32,32);

	var materials = [];

	materials.push(new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('materials/diamond.png') }));
	materials.push(new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('materials/gold.png') }));
	materials.push(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,map: THREE.ImageUtils.loadTexture('materials/iron.png') }));
	materials.push(new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('materials/diamond.png') }));
	materials.push(new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('materials/gold.png') }));
	materials.push(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,map: THREE.ImageUtils.loadTexture('materials/iron.png') }));

	var faceMaterial = new THREE.MeshFaceMaterial(materials);

	for(var a = -5; a <= 5; a++){
		for(var b = -5; b <= 5; b++){
			var mesh = new THREE.Mesh(geometry, faceMaterial)
			mesh.position.set(a, 0, b)
			objects.push(mesh);
			scene.add(mesh);
		}		
	}

	
	axis = new THREE.AxisHelper(50);    
	scene.add(axis);

	camera.position.x = camX;
	camera.position.y = camY;
	camera.position.z = camZ;

	camera.lookAt(origin);

	rotate(angle)

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
	camera.position.x = camX;
	camera.position.z = camZ;
	camera.position.y = camY;

	camera.lookAt(origin);

};

function onKeyDown(event){
	//esc - wylaczanie edycji
	if(event.which == 27){
		edit = false;
		console.log("edit off");
	}

	//edycja wybranego obiektu
	if(edit && intersects.length > 0){
		
		//87 forward
		if(event.which == 87)
			intersects[0].object.position.z--;
		//83 backward
		if(event.which == 83)
			intersects[0].object.position.z++;
		//65 left
		if(event.which == 65)
			intersects[0].object.position.x--;
		//68 right 
		if(event.which == 68)
			intersects[0].object.position.x++;
		//81 up
		if(event.which == 81)
			intersects[0].object.position.y--;
		//69 down
		if(event.which == 69)
			intersects[0].object.position.y++;
	
	//poruszanie kamera
	} else {
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
			angle -= Math.PI/180;
			rotate(angle);
		}

		//68 right 
		if(event.which == 68){
			angle += Math.PI/180;
			rotate(angle);		
		}

		//obrot o 360 stopni
		if(angle > Math.PI * 2)
			angle = 0
		if(angle < 0)
			angle = Math.PI * 2;
	}

	//console.log(event.which);

};

//raycasting
function onMouseDown(event){
	var raycaster = new THREE.Raycaster();
	var mouseVector = new THREE.Vector2();

    mouseVector.x = (event.clientX / WIDTH) * 2 - 1;
    mouseVector.y = -(event.clientY / HEIGHT) * 2 + 1;
    
    raycaster.setFromCamera(mouseVector, camera);
    
    intersects = raycaster.intersectObjects(scene.children);
   
    if (intersects.length > 0){
    	edit = true;
    	console.log("edit on")
    }
      
};

//funkcja obracajaca kamere wokol srodka
function rotate(angle){    
    camX = origin.x + Math.cos(angle) * radius;
	camZ = origin.z + Math.sin(angle) * radius;

};