import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "lil-gui"
import { OBJLoader } from "three/addons/loaders/OBJLoader.js"

/**
 * Base
 */

//loadingmanager
THREE.DefaultLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Started loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  )
}

THREE.DefaultLoadingManager.onLoad = function () {
  console.log("Loading Complete!")
}

THREE.DefaultLoadingManager.onProgress = function (
  url,
  itemsLoaded,
  itemsTotal
) {
  console.log(
    "Loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  )
}

THREE.DefaultLoadingManager.onError = function (url) {
  console.log("There was an error loading " + url)
}

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 *particles
 */

// Geometry
const particlesGeometry = new THREE.BufferGeometry(1, 32, 32)
const count = 5000

const positions = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
)

// Material
const particlesMaterial = new THREE.PointsMaterial()
;(particlesMaterial.size = 0.01),
  (particlesMaterial.sizeAttenuation = true),
  (particlesMaterial.color = new THREE.Color("#ffffff"))

// add Model
let mixer = null

const loader = new OBJLoader()
loader.load(
  "/models/containerNORMAL.obj",
  function (object) {
    scene.add(object)
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded")
  },
  function (error) {
    console.log("An error happened")
  }
)

/**
 * Floor
 */
// const floor = new THREE.Mesh(
//   new THREE.PlaneGeometry(50, 50),
//   new THREE.MeshStandardMaterial({
//     color: "#444444",
//     metalness: 0,
//     roughness: 0.5,
//   })
// )
// floor.receiveShadow = true
// floor.rotation.x = -Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -9
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.position.set(0.25, 3, -2.25)
scene.add(directionalLight2)

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 5
camera.position.x = -2
camera.position.y = 1
scene.add(camera)

//Audio
const listener = new THREE.AudioListener()
camera.add(listener)
//audio source
const sound = new THREE.Audio(listener)
//audio loader
console.log(listener)
const audioLoader = new THREE.AudioLoader()
audioLoader.load("/eliza.mp3", function (buffer) {
  sound.setBuffer(buffer)
  sound.setLoop(true)
  sound.setVolume(0.5)
  sound.play()
})

// create an AudioAnalyser, passing in the sound and desired fftSize
const analyser = new THREE.AudioAnalyser(sound, 32)

// get the average frequency of the sound
const data = analyser.getAverageFrequency()
console.log(data)

//add audio controls
const audioControls = {
  volume: 0.5,
  play: true,
  pause: false,
  stop: false,
}

gui
  .add(audioControls, "volume")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange(() => {
    sound.setVolume(audioControls.volume)
  })

gui.add(audioControls, "play").onChange(() => {
  sound.play()
})

gui.add(audioControls, "pause").onChange(() => {
  sound.pause()
})

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  if (mixer) {
    mixer.update(deltaTime)
  }

  // Update particles
  particles.rotation.y = elapsedTime * 0.1
  particles.rotation.x = elapsedTime * 0.05

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
