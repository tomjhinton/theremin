const THREE = require('three')
import Tone from 'tone'
import * as posenet from '@tensorflow-models/posenet'

let  scene = new THREE.Scene()
let  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 )

scene.add(camera)

const light = new THREE.DirectionalLight( 0xffffff, 1.75 )
var d = 5

light.position.set( d, d, d )

light.castShadow = true
//light.shadowCameraVisible = true;

const theremin = document.getElementById('theremin')

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth, window.innerHeight )
  theremin.appendChild( renderer.domElement )

scene.add( light )

scene.background = new THREE.Color( 0x000000 )
