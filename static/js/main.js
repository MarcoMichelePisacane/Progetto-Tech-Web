//Import the necessary libraries
import * as THREE from '/static/js/threejs/build/three.module.js';
import { GLTFLoader } from '/static/js/threejs/examples/jsm/loaders/GLTFLoader.js';

import * as CANNON from "/static/js/cannonjs/cannon-es.js";
import CannonDebugger from "/static/js/cannonjs/cannon-es-debugger.js";


//we define the buttons previously generated in html to use them in order to call the functions necessary for the game
const button1 = document.querySelector("#button1");
const button2 = document.querySelector("#button2");
const button3 = document.querySelector("#button3");
const button4 = document.querySelector("#button4");
const button5 = document.querySelector("#button5");
const button6 = document.querySelector("#button6");
const button7 = document.querySelector("#button7");
let intervalId;

//button to move forward
button1.addEventListener("mousedown",() => {
	intervalId = setInterval(() => {
		moveOn();
	}, 10);
});
button1.addEventListener('mouseup', () => {
	clearInterval(intervalId);
});

//button to move back
button2.addEventListener("mousedown",() => {
	intervalId = setInterval(() => {
		moveBack();
	}, 10);
});
button2.addEventListener('mouseup', () => {
	clearInterval(intervalId);
});

//button to move left
button3.addEventListener("mousedown",() => {
	intervalId = setInterval(() => {
		moveLeft();
	}, 10);
});
button3.addEventListener('mouseup', () => {
	clearInterval(intervalId);
});

//button to move right
button4.addEventListener("mousedown",() => {
	intervalId = setInterval(() => {
		moveRight();
	}, 10);
});
button4.addEventListener('mouseup', () => {
	clearInterval(intervalId);
});


//button to shoot
button5.addEventListener("click", removeEnemy);

//button to move on the left diagonal
button6.addEventListener("mousedown",() => {
	intervalId = setInterval(() => {
		DL();
	}, 10);
});
button6.addEventListener('mouseup', () => {
	clearInterval(intervalId);
});

//button to move on the right diagonal
button7.addEventListener("mousedown",() => {
	intervalId = setInterval(() => {
		DR();
	}, 10);
});
button7.addEventListener('mouseup', () => {
	clearInterval(intervalId);
});


let camera,scene,renderer;
let gui;
// we define the parameters of the player
let player={height:20, speed:2, turnSpeed:Math.PI*0.02};
let playerWeapon, playerEnemy;
let keyboard = {};
let geometry,material,mesh;
let world;
let cannonDebugger;
let cubeBody, surfaceBody;
let slipperyMaterial, groundMaterial;
let obstacleBody;
let obstaclesBodies = [];
let obstaclesMeshes = [], obstacleMesh;

let duration = 60;

let timer = document.getElementById("timer");
let tolerance = 6;
// let's import the sound effects
let shot = new Audio('/static/audio/sparo.mp3');
let running = new Audio('/static/audio/running.mp3');

let score = 0;




//Set the timer for the duration of the game
setInterval(function() {

	duration--;

	timer.innerHTML = duration;

	if (duration === 0) {
		clearInterval();
		alert("Time's up!");
		window.location.href = 'http://localhost:5000/';
	}
}, 1000);


async function init() {
	//Let's create a new scene
	scene = new THREE.Scene();

	// we set the perspective of the camera and set its position
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, player.height, 400);


	// we insert the light inside the scene
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


	await addPlayerWeapon();


	await addEnemy();


	addObstacleBody();
	await addObstacle();

	animate()
}
//Function for game animation
function animate(){
	requestAnimationFrame(animate);


	
    //w key
	if(keyboard[87])
	{
		moveOn();
	}
	//s key
	if(keyboard[83])
	{
		moveBack();
	}
	//d key
	if(keyboard[68])
	{
		moveRight();
	}
	//a key
	if(keyboard[65])
	{
		moveLeft()
	}
	//space bar
	if(keyboard[32]){
		removeEnemy();
	}
	
    //right arrow key
	if(keyboard[39]){
		rightRotate();
	}
	//left arrow key
	if(keyboard[37]){
		leftRotate();
	}
	//q key
	if(keyboard[81]){
		DL();
	}
	// key and
	if(keyboard[69]){
		DR();
	}




	cannonDebugger.update();


	//weapon position update
	playerWeapon.position.set(camera.position.x,camera.position.y - 1.8, camera.position.z - 4);
	playerWeapon.rotation.set(camera.rotation.x - Math.PI/3, camera.rotation.y + Math.PI/2, camera.rotation.z - Math.PI/6);


	for (let i = 0; i < obstaclesBodies.length; i++) {
		obstaclesMeshes[i].position.copy(obstaclesBodies[i].position);
	}

	renderer.render(scene, camera);


}
function moveOn()
{
	//play the running sound
	running.play();
	//modify the camera coordinates to move the player forward
	camera.position.x += Math.sin(camera.rotation.y) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y) * player.speed;

}
function moveBack()
{
	running.play();
    //modify the camera coordinates to move the player backwards
	camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
	camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
}
function moveRight()
{
	running.play();
    //modify the camera coordinates to move the player to the right
	camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
}
function moveLeft()
{
	running.play();
    //modify the camera coordinates to move the player to the left
	camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
}

function DR()
{
	running.play();
	//we modify the coordinates of the camera to move the player on the right diagonal
	camera.position.x += Math.sin(camera.rotation.y) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;

}
function DL()
{
	running.play();
	//modify the camera coordinates to move the player on the left diagonal
	camera.position.x += Math.sin(camera.rotation.y) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
	camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;

}
//weapon rotation functions
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


//function to insert the weapon in the scene
async function addPlayerWeapon(){

	const gltfLoader = new GLTFLoader().setPath( '/static/image/' );
	const Weapon = await gltfLoader.loadAsync( 'arma.glb' );

	playerWeapon = Weapon.scene.children[0];
	scene.add(playerWeapon);

}

//Function to assign a physicality to the surface
function addSurfaceBody(){
	groundMaterial = new CANNON.Material('ground')
	const planeShape = new CANNON.Box(new CANNON.Vec3(1000, 0.01, 1000));
	surfaceBody = new CANNON.Body({ mass: 0, material: groundMaterial });
	surfaceBody.addShape(planeShape);
	surfaceBody.position.set(0, 0, -6);
	world.addBody(surfaceBody);
}

//Function to insert the piano into the scene
async function addSurface(){
	const gltfLoader = new GLTFLoader().setPath( '/static/image/' );

	const SurfaceLoaded = await gltfLoader.loadAsync( 'plane.glb' );
	let Surface = SurfaceLoaded.scene.children[0];
	Surface.position.set(0, -8, -6);
	scene.add(Surface);
}

//Function to insert the enemy into the scene
async function addEnemy()
{
	const gltfLoader = new GLTFLoader().setPath( '/static/image/' );
	const enemy = await gltfLoader.loadAsync( 'enemy.glb' );

	playerEnemy = enemy.scene.children[0];

	scene.add(playerEnemy);


	playerEnemy.position.set(0, 13, 50);
	playerEnemy.rotateY(-Math.PI/2);

}

//Function to shoot the enemy
function removeEnemy()
{
	shot.play();

	let xCamera = camera.position.x
	let zCamera = camera.position.z

	console.log(playerEnemy.position.z);


	console.log(zCamera);

	//if the enemy is in a certain range with respect to the camera position and we press the button to shoot then the enemy is eliminated from the scene
	if (playerEnemy.position.x >= xCamera - tolerance && playerEnemy.position.x <= xCamera + tolerance && playerEnemy.position.z >= zCamera - 250 && playerEnemy.position.z <= zCamera)
	{
		scene.remove(playerEnemy);
		//we assign a score
		score += 100;
		document.getElementById("score").innerHTML = score;

		//after a short delay we reinsert the enemy into the scene in a pseudo-random position within the limits of the playable plane
		setTimeout(function()
		{
			scene.add(playerEnemy);
			let enemyPositionX = Math.floor(Math.random() * 801) - 400;
			let enemyPositionZ = Math.floor(Math.random() * 701) - 350;
			playerEnemy.position.set(enemyPositionX, 13, enemyPositionZ);
		}, 10);
	}

}


//Function to assign a physicality to boulders
function addObstacleBody(){


	for (let i = 0; i < 20; i++) {
		let obstacleShape = new CANNON.Box(new CANNON.Vec3(10, 10, 10));
		obstacleBody = new CANNON.Body({ mass: 10000 });
		obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(Math.floor(Math.random()*1001) - 500, -7,Math.floor(Math.random()*701)-350);
		world.addBody(obstacleBody);
		obstaclesBodies.push(obstacleBody);


	}

}

// function to load the boulders on the scene
async function addObstacle(){
	const gltfLoader = new GLTFLoader().setPath( '/static/image/' );
	const obstacleLoaded = await gltfLoader.loadAsync( 'roccia.glb' );

	let obstacle = obstacleLoaded.scene.children[0];

	for (let i = 0; i < 20; i++) {
		obstacleMesh = obstacle.clone();
		scene.add(obstacleMesh);

		obstaclesMeshes.push(obstacleMesh);
	}
}

//Function to generate a game world with physical laws
function initCannon() {
	world = new CANNON.World();
    //enter the force of gravity
	world.gravity.set(0, -9.8, 0);

	initCannonDebugger();
}

//we make physicality visible
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

// add the images and generate with them a box that delimits the game environment
function aggSfondo() {

	let materialArray=[];
	let texture_ft=new THREE.TextureLoader().load("/static/image/arid_ft.jpg");
	let texture_bk=new THREE.TextureLoader().load("/static/image/arid_bk.jpg");
	let texture_up=new THREE.TextureLoader().load("/static/image/arid_up.jpg");
	let texture_dn=new THREE.TextureLoader().load("/static/image/arid_dn.jpg");
	let texture_rt=new THREE.TextureLoader().load("/static/image/arid_rt.jpg");
	let texture_lf=new THREE.TextureLoader().load("/static/image/arid_lf.jpg");

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
