import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "lil-gui"

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
const count = 500

const positions = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
)

// Material
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true,
})

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
camera.position.z = 3
scene.add(camera)

//Audio
const listener = new THREE.AudioListener()
camera.add(listener)
//audio source
const sound = new THREE.Audio(listener)
//audio loader
console.log(listener)
const audioLoader = new THREE.AudioLoader()
audioLoader.load("/audio/eliza.mp3", function (buffer) {
  sound.setBuffer(buffer)
  sound.setLoop(true)
  sound.setVolume(0.5)
  sound.play()
})

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

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
