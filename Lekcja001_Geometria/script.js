var lastTime;

var scene;
var camera;
var renderer;

var WIDTH, HEIGHT;

var obj = {};

var fov;
var scale = 1;
var rot = 0.01;

var verticesOfCube = [
    -1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
    -1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
];

var indicesOfFaces = [
    2,1,0,    0,3,2,
    0,4,7,    7,3,0,
    0,1,5,    5,4,0,
    1,2,6,    6,5,1,
    2,3,7,    7,6,2,
    4,5,6,    6,7,4
];

var geometry = [
	new THREE.CubeGeometry(10, 10, 10, 1, 1, 1),//box
	new THREE.CircleGeometry( 5, 32 ),//circle
	new THREE.PlaneGeometry( 5, 20, 32 ),//plane
	new THREE.CylinderGeometry( 5, 5, 20, 32 ),//cylinder
	new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, 6, 2 ),//polyhedron
	new THREE.IcosahedronGeometry(1, 1),//icasohedron
	new THREE.OctahedronGeometry(1, 1),//octahedron
	new THREE.RingGeometry( 1, 5, 32 ),//ring
	new THREE.SphereGeometry( 5, 32, 32 ),//sphere
	new THREE.TetrahedronGeometry(1, 1),//tetrahedron
	new THREE.TorusGeometry( 10, 3, 16, 100 ),//torus
]

function init(){
	
	
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
	    45, // kąt patrzenia kamery (FOV - field of view)
	    4/3, // proporcje widoku
	    0.1, // min renderowana odległość
	    10000 // max renderowana odległość
    );

    renderer = new THREE.WebGLRenderer();

    // kolor tła 0x zamiast #
	renderer.setClearColor(0x000000);

	WIDTH = 800//window.innerWidth;
	HEIGHT = 600//window.innerHeight;

	renderer.setSize(WIDTH, HEIGHT);

	document.getElementById("div1").appendChild(renderer.domElement);

	obj.geometry = new THREE.CubeGeometry(10, 10, 10, 1, 1, 1);

	obj.material = new THREE.MeshBasicMaterial({
	    color: 0x0000ff, side: THREE.DoubleSide, wireframe: true });

	obj.mesh = new THREE.Mesh(obj.geometry, obj.material);          

	scene.add(obj.mesh);

	//camera.position.x = -200;
	camera.position.y = 50;
	camera.position.z = 200;

	//camera.lookAt(obj.mesh.position);

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
	obj.mesh.scale.set(scale, scale, scale);
	obj.mesh.rotation.y += rot;

}
function change(){
	fov = parseInt(document.getElementById("fov").value);
	camera.fov = fov;
	camera.updateProjectionMatrix();

	scale = parseFloat(document.getElementById("scale").value);

	rot = parseFloat(document.getElementById("rot").value);
}
function selected(value)
{
	scene.remove(obj.mesh);
	obj.geometry = geometry[value];
	obj.mesh = new THREE.Mesh(obj.geometry, obj.material); 
	scene.add(obj.mesh)
}

function button(e)
{
	camera.rotation.y += Math.PI/180;
	//console..
}