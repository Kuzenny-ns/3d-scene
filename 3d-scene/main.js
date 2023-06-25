import './style.css'

import * as THREE from 'three'

import { CameraAnimator, KeyFrame } from './CameraAnimator/CameraAnimator.js';
import {BoxColors, EdgeColors} from './utils/enums.js';
import { SafeAnimator } from './SceneAnimator/SafeAnimator';
import { GearAnimator } from './SceneAnimator/GearAnimator.js';
import { TileAnimator } from './SceneAnimator/TileAnimator.js';

import {SMAAEffect, EffectComposer, SelectiveBloomEffect, EffectPass, RenderPass} from 'postprocessing';
import { BlendFunction, PredicationMode } from 'postprocessing';


//---Variables---//
var canvas = document.getElementById('bg');
var canvasHeight = canvas.offsetHeight;
var canvasWidth = canvas.offsetWidth;
var scrollKeyFrames = [0, 3200, 6300, 7500];
const freqArray = Array(100).fill().map(() => THREE.MathUtils.randFloat(0.5, 1.5));
const ampArray = Array(100).fill().map(() => THREE.MathUtils.randFloat(0.04, 0.08));

window.addEventListener('resize', onWindowResize, false);
document.getElementById("btn_up").addEventListener('click', ArrowUp, false)
document.getElementById("btn_down").addEventListener('click', ArrowDown, false)

function onWindowResize()
{
	mainCamera.aspect = window.innerWidth / window.innerHeight;
	mainCamera.updateProjectionMatrix();

	composer.setSize(window.innerWidth, window.innerHeight);
}

function ArrowUp()
{
	for (let i = scrollKeyFrames.length - 1; i >= 0; i--)
	{
		if(scrollKeyFrames[i] < window.scrollY)
		{
			document.documentElement.scrollTop = scrollKeyFrames[i];
			return;
		}
	}
}

function ArrowDown()
{
	for (let i = 0; i < scrollKeyFrames.length; i++)
	{
		if(scrollKeyFrames[i] > window.scrollY)
		{
			document.documentElement.scrollTop = scrollKeyFrames[i];
			return;
		}
	}
}

function CreateBackGround(density, boxSizeMin ,boxSizeMax, offset)
{
	var background = [];
	if(offset == undefined)
	{
		offset = new THREE.Vector3(0, 0, 0);
	}


	for (let i = 0; i < density; i++)
	{
		var randVector = new THREE.Vector3();
		randVector.randomDirection();
		randVector.multiplyScalar(THREE.MathUtils.randFloat(boxSizeMin, boxSizeMax));

		randVector.x = randVector.x + offset.x;
		randVector.y = randVector.y + offset.y;
		randVector.z = randVector.z + offset.z;

		var randInt = Math.floor(Math.random() * 4);
		var RandColor = BoxColors[randInt];
		var RandEdgeColor = EdgeColors[randInt];

		var boxSize = THREE.MathUtils.randFloat(8, 12);

		var box = new THREE.Mesh(
			new THREE.BoxGeometry(boxSize, boxSize, boxSize),
			new THREE.MeshBasicMaterial({color: RandColor, transparent: true, opacity: 0.5})
		);//MeshStandardMaterial     MeshToonMaterial
		box.position.set(randVector.x, randVector.y, randVector.z)

		scene.add(box);
		background.push(box);

		const edges = new THREE.EdgesGeometry(box.geometry); 
		const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: RandEdgeColor, side: THREE.FrontSide } ) ); 
		box.add( line );
	}
	return background;
}

function BlockBob(boxArray, time)
{
	if(boxArray == undefined)
	{
		return;
	}
	if(time == undefined)
	{
		time = new Date().getTime() / 1000;
	}

	boxArray.forEach(function(entry, index){
		var i = index % 100;
		entry.position.y += -Math.sin(time * freqArray[i]) * ampArray[i];
		entry.position.z += Math.sin(time * freqArray[i]) * ampArray[i];
		entry.position.x += Math.cos(time * freqArray[i]) * ampArray[i];
	});
}


//#region INITIALIZATION
const scene = new THREE.Scene();

const mainCamera = new THREE.PerspectiveCamera(55, canvasWidth / canvasHeight, 0.1, 5000);


const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('bg'), 
	antialias: false,
	stencil: false,
	depth: false
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasWidth, canvasHeight);
scene.background = new THREE.TextureLoader().load('3D_models/Backgroung.png');
scene.backgroundIntensity = 0.1;

mainCamera.position.x = 100;
mainCamera.position.y = 150;
mainCamera.position.z = 100;

mainCamera.lookAt(new THREE.Vector3(0, -10, 0));
//#endregion

//#region LIGHT
//===Light===//
const pointlight = new THREE.PointLight(0xffffff, 0.7)

pointlight.position.set(100, 100, 0);
pointlight.castShadow = true;

const amb = new THREE.AmbientLight(0xffffff, 0.05);

scene.add(pointlight);

scene.add(amb);
//#endregion

//#region POST-PROCESSING
renderer.autoClear = false;

const composer = new EffectComposer(renderer);

//BLOOM
const bloomPass = new SelectiveBloomEffect(scene, mainCamera, {
	blendFunction: BlendFunction.ADD,
	mipmapBlur: true,
	luminanceThreshold: 0.001,
	luminanceSmoothing: 0.3,
	intensity: 5.0
});
bloomPass.selection.exclusive = false;
bloomPass.inverted = true;

//SMAA
const smaaPass = new SMAAEffect();
smaaPass.edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
smaaPass.edgeDetectionMaterial.PredicationMode = PredicationMode.DEPTH;
smaaPass.edgeDetectionMaterial.PredicationThreshold = 0.002;
smaaPass.edgeDetectionMaterial.PredicationScale = 1.0;


const effectPass = new EffectPass(mainCamera, bloomPass, smaaPass);
composer.addPass(new RenderPass(scene, mainCamera))
composer.addPass(effectPass);
//#endregion

//#region CAMERA ANIMATOR
var Animator = new CameraAnimator(mainCamera, window.scrollY);

Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(100, 100, 100), new THREE.Vector3(0, 120, 0), undefined, 0, undefined, 0.5, document.getElementById('about_element')));
Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(100, 150, 100), new THREE.Vector3(0, -10, 0), undefined, 600, undefined, undefined, document.getElementById('D1')));
Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(-105, 60, 100), new THREE.Vector3(35, -10, 35), undefined, 3200, undefined, 0.05));

Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(-90, 1010, 100), new THREE.Vector3(-35, 990, -35), undefined, 3300, undefined, undefined, document.getElementById('D2')));
Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(-70, 1030, -100), new THREE.Vector3(135, 990, 35), undefined, 6300, undefined, 0.05));

Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(-70, 2060, -100), new THREE.Vector3(0, 2020, 0), undefined, 6500, undefined, undefined, document.getElementById('D3')));
Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(-60, 2060, 30), new THREE.Vector3(50, 2000, 20), undefined, 8000));

Animator.AddKeyFrames(new KeyFrame(new THREE.Vector3(-60, 2020, 10), new THREE.Vector3(50, 2000, 30), undefined, 10000));
//#endregion


//Backgraound Blocks
var bg1 = CreateBackGround(800, 250, 500, new THREE.Vector3(0, 0, 0));
var bg2 = CreateBackGround(500, 150, 500, new THREE.Vector3(0, 1000, 0));
var bg3 = CreateBackGround(400, 250, 500, new THREE.Vector3(0, 2000, 0));

//Scenes
var Safe = new SafeAnimator(scene, new THREE.Vector3(0, 990, 0), new THREE.Vector3(0, -135, 0), 10, bloomPass);
var Gears = new GearAnimator(scene, new THREE.Vector3(50, 2020, -65), new THREE.Vector3(90, 0, 90), 10, bloomPass)
var Tiles = new TileAnimator(scene, new THREE.Vector3(-70, 0, 0), new THREE.Vector3(0, 0, 0), 30, bloomPass);


function animate()
{
	composer.render();

	requestAnimationFrame(animate);

	var time = new Date().getTime() / 1000;

	Animator.UpdateAnimation(window.scrollY);

	let current_scroll = Animator.GetTimeStamp();

	if(current_scroll < 600)
	{
		Tiles.ResetAnimation();
		BlockBob(bg1, time);
	}
	else if(current_scroll >= 600 && current_scroll < 3250)
	{
		pointlight.position.set(100, 100, 0);
		BlockBob(bg1, time);

		if(!Tiles.isLocked)
		{
			Tiles.StartAnimation();
			Tiles.LockAnimation();
		}
		Safe.ResetAnimation();
	}
	else if(current_scroll >= 3250 && current_scroll < 6400)
	{
		pointlight.position.set(-40, 1100, 0);
		BlockBob(bg2, time);

		if(!Safe.isLocked)
		{
			Safe.StartAnimation();
			Safe.LockAnimation();
		}
		Tiles.ResetAnimation();
	}
	else if (current_scroll >= 6400)
	{
		pointlight.position.set(-40, 2100, 0);
		BlockBob(bg3, time);
		Safe.ResetAnimation();
	}

	Safe.UpdateLoop(current_scroll, 3250, 6400);
	Gears.UpdateLoop();
	Tiles.UpdateLoop();
}

animate();