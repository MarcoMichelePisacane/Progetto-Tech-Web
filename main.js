import * as THREE from './build/three.module.js'
//import {GLTFLoader} from './examples/jsm/loaders/GLTFLoader';

let scene, camera, renderer, mesh, meshFloor, ambientLight, light;
let keyboard = {};
let player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };


function init(){

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color:0xff4444})
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add(mesh);

	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(50,50,50,50),
		new THREE.MeshPhongMaterial({color:0xffffff})
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);

	ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-5,10,-5);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 100;
	scene.add(light);


/*
	let loader = new GLTFLoader();
	loader.load('scene.gltf', function(gltf)
	{
		scene.add(gltf.scene);
	});
*/

	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));



	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	animate();
}

function animate(){
	requestAnimationFrame(animate);

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;


	if(keyboard[87]){
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}


	if(keyboard[37]){
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){
		camera.rotation.y += player.turnSpeed;
	}

	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;
