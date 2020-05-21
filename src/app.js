const THREE = require('three')
import Tone from 'tone'
import * as posenet from '@tensorflow-models/posenet'

let  scene = new THREE.Scene()
let  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 )

scene.add(camera)
