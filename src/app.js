const THREE = require('three')
import Tone from 'tone'
import './style.scss'
import * as posenet from '@tensorflow-models/posenet'
import {OBJLoader2}  from 'three/examples/jsm/loaders/OBJLoader2.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import dat from 'dat.gui'
import Stats from 'stats.js'
import '@babel/polyfill'
const videoWidth =  window.innerWidth
const videoHeight = window.innerHeight
const stats = new Stats()
import { drawKeypoints, drawSkeleton, drawHeatMapValues } from './demo_util'
console.log(videoWidth)
const  scene = new THREE.Scene()
const  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 )
camera.position.z = 30
scene.add(camera)

const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 40, 25, 10 )
light.castShadow = true
scene.add(light)


const theremin = document.getElementById('theremin')

const renderer = new THREE.WebGLRenderer({alpha: true })
renderer.setSize( window.innerWidth, window.innerHeight )
theremin.appendChild( renderer.domElement )
// var controls = new OrbitControls( camera, renderer.domElement );



let left
let right
var loader =  new OBJLoader2
var loader2 =  new OBJLoader2
const material = new THREE.MeshPhongMaterial( { color: 0x000FF0, specular: 0xf22fff , shininess: 100, side: THREE.DoubleSide } )

console.log(loader)
// load a resource
loader.load(
	// resource URL
	'assets/left.obj',
	// called when resource is loaded
	function ( object ) {
    console.log(object)
    object.traverse( function ( child ) {

      if ( child instanceof THREE.Mesh ) {

        child.material = material

                }

                } )
    left =  object
		scene.add( left )

  },
  // called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
)

loader2.load(
  // resource URL
  'assets/right.obj',
  // called when resource is loaded
  function ( object ) {
    console.log(object)
    object.traverse( function ( child ) {

      if ( child instanceof THREE.Mesh ) {

        child.material = material

      }

    } )
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



function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isMobile() {
  return isAndroid() || isiOS()
}

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw 'Browser API navigator.mediaDevices.getUserMedia not available'
  }

  const video = document.getElementById('video')
  video.width = videoWidth
  video.height = videoHeight

  const mobile = isMobile()
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined: videoHeight}
  })
  video.srcObject = stream

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video)
    }
  })
}

async function loadVideo() {
  const video = await setupCamera()
  video.play()

  return video
}

const guiState = {
  algorithm: 'single-pose',
  input: {
    mobileNetArchitecture: isMobile() ? '0.50' : '1.01',
    outputStride: 16,
    imageScaleFactor: 0.5
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5
  },
  multiPoseDetection: {
    maxPoseDetections: 2,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.3,
    nmsRadius: 20.0
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true
  },
  net: null
}

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras, net) {
  guiState.net = net

  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId
  }

  const cameraOptions = cameras.reduce((result, { label, deviceId }) => {
    result[label] = deviceId
    return result
  }, {})

  const gui = new dat.GUI({ width: 300, autoPlace: false  })

  // The single-pose algorithm is faster and simpler but requires only one person to be
  // in the frame or results will be innaccurate. Multi-pose works for more than 1 person
  const algorithmController = gui.add(
    guiState, 'algorithm', ['single-pose', 'multi-pose'])

  // The input parameters have the most effect on accuracy and speed of the network
  const input = gui.addFolder('Input')
  // Architecture: there are a few PoseNet models varying in size and accuracy. 1.01
  // is the largest, but will be the slowest. 0.50 is the fastest, but least accurate.
  const architectureController =
    input.add(guiState.input, 'mobileNetArchitecture', ['1.01', '1.00', '0.75', '0.50'])
  // Output stride:  Internally, this parameter affects the height and width of the layers
  // in the neural network. The lower the value of the output stride the higher the accuracy
  // but slower the speed, the higher the value the faster the speed but lower the accuracy.
  input.add(guiState.input, 'outputStride', [8, 16, 32])
  // Image scale factor: What to scale the image by before feeding it through the network.
  input.add(guiState.input, 'imageScaleFactor').min(0.2).max(1.0)
  //input.open();

  // Pose confidence: the overall confidence in the estimation of a person's
  // pose (i.e. a person detected in a frame)
  // Min part confidence: the confidence that a particular estimated keypoint
  // position is accurate (i.e. the elbow's position)
  const single = gui.addFolder('Single Pose Detection')
  single.add(guiState.singlePoseDetection, 'minPoseConfidence', 0.0, 1.0)
  single.add(guiState.singlePoseDetection, 'minPartConfidence', 0.0, 1.0)
  //single.open();

  const multi = gui.addFolder('Multi Pose Detection')
  multi.add(
    guiState.multiPoseDetection, 'maxPoseDetections').min(1).max(20).step(1)
  multi.add(guiState.multiPoseDetection, 'minPoseConfidence', 0.0, 1.0)
  multi.add(guiState.multiPoseDetection, 'minPartConfidence', 0.0, 1.0)
  // nms Radius: controls the minimum distance between poses that are returned
  // defaults to 20, which is probably fine for most use cases
  multi.add(guiState.multiPoseDetection, 'nmsRadius').min(0.0).max(40.0)

  const output = gui.addFolder('Output')
  output.add(guiState.output, 'showVideo')
  output.add(guiState.output, 'showSkeleton')
  output.add(guiState.output, 'showPoints')
  //output.open();


  architectureController.onChange(function (architecture) {
    guiState.changeToArchitecture = architecture
  })

  algorithmController.onChange(function (value) {
    switch (guiState.algorithm) {
      case 'single-pose':
        multi.close()
        single.open()
        break
      case 'multi-pose':
        single.close()
        multi.open()
        break
    }
  })
}

/**
 * Sets up a frames per second panel on the top-left of the window
 */
function setupFPS() {
  //stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  //document.body.appendChild(stats.dom);
}

/**
 * Feeds an image to posenet to estimate poses - this is where the magic happens.
 * This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById('output')
  const ctx = canvas.getContext('2d')
  const flipPoseHorizontal = false // since images are being fed from a webcam

  canvas.width = videoWidth
  canvas.height = videoHeight

  async function poseDetectionFrame() {
    if (guiState.changeToArchitecture) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose()

      // Load the PoseNet model weights for either the 0.50, 0.75, 1.00, or 1.01 version
      guiState.net = await posenet.load(Number(guiState.changeToArchitecture))

      guiState.changeToArchitecture = null
    }

    // Begin monitoring code for frames per second
    stats.begin()

    // Scale an image down to a certain factor. Too large of an image will slow down
    // the GPU
    const imageScaleFactor = guiState.input.imageScaleFactor
    const outputStride = Number(guiState.input.outputStride)

    let poses = []
    // console.log(poses)
    // console.log(poses.keypoints)




    let minPoseConfidence
    let minPartConfidence
    switch (guiState.algorithm) {
      case 'single-pose':
      const pose = await guiState.net.estimatePoses(video, {
        flipHorizontal: flipPoseHorizontal,
        decodingMethod: 'single-person'
      });

        poses.push(pose)

        if(poses.length>= 1){
        // left.position.x = poses[0][0].keypoints[9].position.x

        if(poses[0][0].keypoints[9].position.x < 600){



        }

        if(poses[0][0].keypoints[10].position.y < 200){



        }

        if(poses[0][0].keypoints[10].position.y > 200){



        }




        }






        minPoseConfidence = Number(
          guiState.singlePoseDetection.minPoseConfidence)
        minPartConfidence = Number(
          guiState.singlePoseDetection.minPartConfidence)
        break
      case 'multi-pose':
        poses = await guiState.net.estimateMultiplePoses(video, imageScaleFactor, flipPoseHorizontal, outputStride,
          guiState.multiPoseDetection.maxPoseDetections,
          guiState.multiPoseDetection.minPartConfidence,
          guiState.multiPoseDetection.nmsRadius)

        minPoseConfidence = Number(guiState.multiPoseDetection.minPoseConfidence)
        minPartConfidence = Number(guiState.multiPoseDetection.minPartConfidence)
        break
    }

    ctx.clearRect(0, 0, videoWidth, videoHeight)


    if (guiState.output.showVideo) {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.translate(-videoWidth, 0)
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
      ctx.restore()
    }

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores
    poses[0].forEach(({ score, keypoints }) => {
      if (score >= minPoseConfidence) {
        if (guiState.output.showPoints) {
          drawKeypoints(keypoints, minPartConfidence, ctx)
          left.position.x = poses[0][0].keypoints[9].position.x
          right.position.x = poses[0][0].keypoints[10].position.x
        }
        if (guiState.output.showSkeleton) {
          drawSkeleton(keypoints, minPartConfidence, ctx)
        }
      }
    })

    // End monitoring code for frames per second
    stats.end()


    requestAnimationFrame(poseDetectionFrame)
  }

  poseDetectionFrame()
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading available
 * camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {
  // Load the PoseNet model weights for version 1.01
  const net = await posenet.load()

  // document.getElementById('loading').style.display = 'none';
  // document.getElementById('main').style.display = 'block';

  let video

  try {
    video = await loadVideo();
  } catch(e) {

    throw e
  }

  setupGui([], net)
  setupFPS()
  detectPoseInRealTime(video, net)

}

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia
bindPage() /// kick off the demo


const base = new THREE.BoxGeometry( 8, 2, 3 )
const table = new THREE.BoxGeometry( 30, 2, 3 )
const  ant = new THREE.CylinderGeometry( 0.2, 0.2, 5, 10 )
const  materialT =  new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
  transparent: false } )

const  materialTable =  new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,transparent: false } )




const baseMesh = new THREE.Mesh( base, materialT )
const antMesh = new THREE.Mesh( ant, materialT )
const tableMesh = new THREE.Mesh( table, materialTable )
tableMesh.position.z=-1

scene.add(baseMesh, antMesh, tableMesh)


function animate() {

  update()

  /* render scene and camera */
  renderer.render(scene,camera)
  requestAnimationFrame(animate)
}



requestAnimationFrame(animate)
