import * as THREE from '/threejs/build/three.module.js';
import { GLTFLoader } from '/threejs/examples/jsm/loaders/GLTFLoader.js';
import GUI from '/threejs/examples/jsm/libs/lil-gui.module.min.js';

import * as CANNON from "/cannonjs/cannon-es.js";
import CannonDebugger from "/cannonjs/cannon-es-debugger.js";



const button1 = document.querySelector("#button1");
const button2 = document.querySelector("#button2");
const button3 = document.querySelector("#button3");
const button4 = document.querySelector("#button4");
const button5 = document.querySelector("#button5");
const button6 = document.querySelector("#button6");
const button7 = document.querySelector("#button7");

button1.addEventListener("click", moveOn);
button2.addEventListener("click", moveBack);
button3.addEventListener("click", moveLeft);
button4.addEventListener("click", moveRight);
button5.addEventListener("click", removeEnemy);
button6.addEventListener("click", leftRotate);
button7.addEventListener("click", rightRotate);




let camera,scene,renderer;

// helpers to debug
//let controls;
let gui;

// show and move cube
let player={height:20, speed:5, turnSpeed:Math.PI*0.02};
let playerWeapon, playerEnemy;
let keyboard = {};
let geometry,material,mesh;


//let enableFollow = true;


let world;
let cannonDebugger;
let cubeBody, surfaceBody;
let slipperyMaterial, groundMaterial;
let obstacleBody;
let obstaclesBodies = [];
let obstaclesMeshes = [], obstacleMesh;

async function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, player.height, 400);
	//camera.lookAt(new THREE.Vector3(0,player.height,0));

	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	material = new THREE.MeshNormalMaterial();

	mesh = new THREE.Mesh( geometry, material );

	scene.add( mesh );

	const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
	scene.add(ambient);

	const light = new THREE.DirectionalLight(0xFFFFFF, 1);
	light.position.set( 1, 10, 6);
	scene.add(light);



	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;


	document.body.appendChild(renderer.domElement);


	initCannon();


	aggSfondo();

	addSurfaceBody();
	await addSurface();

	addCubeBody();
	await addPlayerWeapon();


	await addEnemy();


	addObstacleBody();
	await addObstacle();

	//addContactMaterials();

	addGUI();

	animate()
}

function animate(){
	requestAnimationFrame(animate);



	if(keyboard[87])
	{
		moveOn();
	}
	if(keyboard[83])
	{
		moveBack();
	}
	if(keyboard[68])
	{
		moveRight();
	}
	if(keyboard[65])
	{
		moveLeft()
	}

	if(keyboard[39]){
		rightRotate();
	}
	if(keyboard[37]){
		leftRotate();
	}



	cannonDebugger.update();



	playerWeapon.position.set(camera.position.x,camera.position.y - 1.8, camera.position.z - 4);
	playerWeapon.rotation.set(camera.rotation.x - Math.PI/3, camera.rotation.y + Math.PI/2, camera.rotation.z - Math.PI/6);

	mesh.position.set(playerWeapon.position.x, playerWeapon.position.y - 5, playerWeapon.position.z - 5.5);

	cubeBody.position.copy(mesh.position);







	for (let i = 0; i < obstaclesBodies.length; i++) {
		obstaclesMeshes[i].position.copy(obstaclesBodies[i].position);
		//obstaclesMeshes[i].rotation.copy(obstaclesBodies[i].rotation);
	}

	renderer.render(scene, camera);


}
function moveOn()
{
	camera.position.x += Math.sin(camera.rotation.y) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
}
function moveBack()
{
	camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
	camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
}
function moveRight()
{
	camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
}
function moveLeft()
{
	camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
}
function rightRotate()
{
	if (camera.rotation.y >= -Math.PI / 4)
	{
		camera.rotation.y -= player.turnSpeed;
	}

}
function leftRotate()
{


	if (camera.rotation.y <= Math.PI / 4)
	{
		camera.rotation.y += player.turnSpeed;
	}

}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}



window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

function addCubeBody(){
	let cubeShape = new CANNON.Box(new CANNON.Vec3(3,10,3));
	slipperyMaterial = new CANNON.Material('slippery');
	cubeBody = new CANNON.Body({ mass: 100,material: slipperyMaterial });
	cubeBody.addShape(cubeShape, new CANNON.Vec3(0,0,-1));
	cubeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 180 * 180);
	world.addBody(cubeBody);
}

async function addPlayerWeapon(){

	const gltfLoader = new GLTFLoader().setPath( '/image/' );
	const Weapon = await gltfLoader.loadAsync( 'arma.glb' );

	playerWeapon = Weapon.scene.children[0];
	scene.add(playerWeapon);

}


function addSurfaceBody(){
	groundMaterial = new CANNON.Material('ground')
	const planeShape = new CANNON.Box(new CANNON.Vec3(10000, 0.01, 10000));
	surfaceBody = new CANNON.Body({ mass: 0, material: groundMaterial });
	surfaceBody.addShape(planeShape);
	surfaceBody.position.set(0, 0, -6);
	world.addBody(surfaceBody);
}



async function addSurface(){
	const gltfLoader = new GLTFLoader().setPath( '/image/' );

	const SurfaceLoaded = await gltfLoader.loadAsync( 'plane.glb' );
	let Surface = SurfaceLoaded.scene.children[0];
	Surface.position.set(0, -8, -6);
	scene.add(Surface);
}

async function addEnemy()
{
	const gltfLoader = new GLTFLoader().setPath( '/image/' );
	const enemy = await gltfLoader.loadAsync( 'enemy.glb' );

	playerEnemy = enemy.scene.children[0];

	scene.add(playerEnemy);

	playerEnemy.position.set(0, 13, 50);
	playerEnemy.rotateY(-Math.PI/2);

}

function removeEnemy()
{
	let enemyPositionX = Math.floor(Math.random() * 301) - 150;
	let enemyPositionZ = Math.floor(Math.random() * 701) - 350;
	scene.remove(playerEnemy);

	setTimeout(function()
	{
		scene.add(playerEnemy);
		playerEnemy.position.set(enemyPositionX, 13, enemyPositionZ);
	}, 2500);

}

function addObstacleBody(){


	for (let i = 0; i < 20; i++) {
		let obstacleShape = new CANNON.Box(new CANNON.Vec3(3, 3, 3));
		obstacleBody = new CANNON.Body({ mass: 10000 });
		obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(Math.floor(Math.random()*301) - 150, -1,Math.floor(Math.random()*701)-350);
		world.addBody(obstacleBody);
		obstaclesBodies.push(obstacleBody);


	}

}

async function addObstacle(){
	const gltfLoader = new GLTFLoader().setPath( '/image/' );
	const obstacleLoaded = await gltfLoader.loadAsync( 'roccia.glb' );

	let obstacle = obstacleLoaded.scene.children[0];

	for (let i = 0; i < 20; i++) {
		obstacleMesh = obstacle.clone();
		scene.add(obstacleMesh);

		obstaclesMeshes.push(obstacleMesh);
	}
}
/*
function addContactMaterials(){
	const slippery_ground = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
		friction: 10000.00,
		restitution: 0.0, //bounciness
		//contactEquationStiffness: 1e8,
		//contactEquationRelaxation: 3,
	})

	world.addContactMaterial(slippery_ground)

}

 */




function addGUI(){
	gui = new GUI();
	gui.hide();
	/*
	const options = {
		orbitsControls: false
	}

	gui.add(options, 'orbitsControls').onChange( value => {
		if (value){
			controls.enabled = true;
			enableFollow = false;
		}else{
			controls.enabled = false;
			enableFollow = true;
		}
	});
	gui.hide();


	// show and hide GUI if user press g
	window.addEventListener('keydown', function(event){
		if(event.keyCode === 71){
			if(gui._hidden){
				gui.show();
			}else{
				gui.hide();
			}
		}
	})

	 */


}

function initCannon() {
	world = new CANNON.World();
	world.gravity.set(0, -9.8, 0);

	initCannonDebugger();
}

function initCannonDebugger(){
	cannonDebugger = new CannonDebugger(scene, world, {
		onInit(body, mesh) {
			mesh.visible = false;
			document.addEventListener("keydown", (event) => {
				if (event.key === "f") {
					mesh.visible = !mesh.visible;
				}
			});
		},
	});
}

function aggSfondo() {

	let materialArray=[];
	let texture_ft=new THREE.TextureLoader().load("/image/arid_ft.jpg");
	let texture_bk=new THREE.TextureLoader().load("/image/arid_bk.jpg");
	let texture_up=new THREE.TextureLoader().load("/image/arid_up.jpg");
	let texture_dn=new THREE.TextureLoader().load("/image/arid_dn.jpg");
	let texture_rt=new THREE.TextureLoader().load("/image/arid_rt.jpg");
	let texture_lf=new THREE.TextureLoader().load("/image/arid_lf.jpg");

	materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
	materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
	materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
	materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
	materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
	materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));

	for(let i=0; i<6; i++ )
		materialArray[i].side = THREE.BackSide;

	let skyboxSet = new THREE.BoxGeometry(1000,1000,1000);
	let skybox = new THREE.Mesh(skyboxSet, materialArray);
	scene.add(skybox);
}

window.onload = init;
