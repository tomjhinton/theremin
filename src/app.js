const THREE = require('three')
import Tone from 'tone'
import * as posenet from '@tensorflow-models/posenet'
import {OBJLoader2}  from 'three/examples/jsm/loaders/OBJLoader2.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let  scene = new THREE.Scene()
let  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 )
camera.position.z = 30
scene.add(camera)

const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 40, 25, 10 )
light.castShadow = true
scene.add(light)


const theremin = document.getElementById('theremin')

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
theremin.appendChild( renderer.domElement )
// var controls = new OrbitControls( camera, renderer.domElement );



scene.background = new THREE.Color( 0x000000 )
let left
let right
var loader =  new OBJLoader2
var loader2 =  new OBJLoader2
console.log(loader)
// load a resource
loader.load(
	// resource URL
	'assets/left.obj',
	// called when resource is loaded
	function ( object ) {
    console.log(object)
    left =  object
		scene.add( left );

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

loader2.load(
	// resource URL
	'assets/right.obj',
	// called when resource is loaded
	function ( object ) {
    console.log(object)
    right =  object
		scene.add( right )

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' )

	}
);

var update = function() {
if(left && right){

}


}



var controls = new OrbitControls( camera, renderer.domElement );

function animate() {

  update()

  /* render scene and camera */
  renderer.render(scene,camera)
  requestAnimationFrame(animate)
}



requestAnimationFrame(animate)
