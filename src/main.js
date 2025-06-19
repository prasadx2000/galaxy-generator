import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import * as dat from 'lil-gui'

const gui = new dat.GUI({
  width: 360
})

//Texture Loader
const textureLoader = new THREE.TextureLoader()

//Scene
const scene = new THREE.Scene()
// scene.add(new THREE.AxesHelper(10))

/**
 * Galaxy
 */

const parameters = {
  count: 100000,
  size: 0.02,
  radius: 5,
  branches: 3,
  spin: 1.98,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
}

let geometry = null
let material = null
let points = null

const generateGalaxy = () =>{

/**
 * Destroy old galaxy
 */
if(points !==null){
  geometry.dispose()
  material.dispose()
  scene.remove(points)
}

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)
  const sizes = new Float32Array(parameters.count)

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)



  for(let i=0; i< parameters.count; i++){

    const i3 = i*3

    //Positions
    const radius = Math.random() * parameters.radius
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
    const spinAngle = radius * parameters.spin

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1: -1) 
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1: -1) 
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1: -1) 

    positions[i3 + 0] = Math.sin(branchAngle + spinAngle) * radius + randomX
    positions[i3 + 1] = randomY
    positions[i3 + 2] = Math.cos(branchAngle + spinAngle) * radius + randomZ

    //Colors

    const mixedColor = colorInside.clone()
    mixedColor.lerp(colorOutside, radius / parameters.radius)

    colors[i3 + 0] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  )

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    
  })
  

  /**
   * Points
   */
  points = new THREE.Points(geometry, material)
  scene.add(points)
}

generateGalaxy()    //Galaxy generate callback

const galaxyFolder = gui.addFolder('Galaxy')

galaxyFolder
  .add(parameters, 'count')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy)

galaxyFolder
  .add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.0001)
  .onFinishChange(generateGalaxy)

galaxyFolder
  .add(parameters, 'radius')
  .min(0.01)
  .max(100)
  .step(0.0001)
  .onFinishChange(generateGalaxy)
 
galaxyFolder
  .add(parameters, 'branches')
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy)
 
galaxyFolder
  .add(parameters, 'spin')
  .min(-5)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy)
 
galaxyFolder
  .add(parameters, 'randomness')
  .min(0)
  .max(5)
  .step(1)
  .onFinishChange(generateGalaxy)
 
galaxyFolder
  .add(parameters, 'randomnessPower')
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy)
 
galaxyFolder
  .addColor(parameters, 'insideColor')
  .onFinishChange(generateGalaxy)
 
galaxyFolder
  .addColor(parameters, 'outsideColor')
  .onFinishChange(generateGalaxy)

galaxyFolder.close()
gui.close()

/**
 * Earth Textures
 */

const earthDiffuse = textureLoader.load('./textures/Earth/diffuse.jpg')
const earthBump = textureLoader.load('./textures/Earth/bump.jpg')
const earthNight = textureLoader.load('./textures/Earth/night.jpg')

//Earth
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 64, 32),
  new THREE.MeshStandardMaterial({
    map: earthNight
    // color: 'white',
    // emissive: new THREE.Color(0xff6030),
    // emissiveIntensity: 1
  })
)
scene.add(earth)
earth.position.set(0,2,0)

/**
 * Light Section
 */
const pointLight = new THREE.PointLight(
  {color: 'ff6030'},
  3,
  5,
  0.89)
scene.add(pointLight)
pointLight.position.set(0,2,2)
// pointLight.position.set(0,2,0)
pointLight.lookAt(earth.position)

//LightHelper
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1)
// scene.add(pointLightHelper)

//Light GUI
const lightFolder = gui.addFolder('Light')
const lightPosition = lightFolder.addFolder('Position')
lightPosition
  .add(pointLight.position, 'x')
  .min(-10)
  .max(10)
  .step(0.01)
 
lightPosition
  .add(pointLight.position, 'y')
  .min(-10)
  .max(10)
  .step(0.01)
 
lightPosition
  .add(pointLight.position, 'z')
  .min(-10)
  .max(10)
  .step(0.01)

lightFolder
  .addColor(pointLight, 'color')
 
lightFolder
  .add(pointLight,'intensity')
  .min(0)
  .max(10)

lightFolder
  .add(pointLight,'distance')
  .min(0)
  .max(10)

lightFolder
  .add(pointLight,'decay')
  .min(0)
  .max(10)

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth/ window.innerHeight,
  0.1,
  1000
)
camera.position.set(0,4,0)
scene.add(camera)

//Renderer
const canvas = document.querySelector('.canvas')
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)

//Orbit Controls
const controls = new OrbitControls(camera, canvas)

const clock = new THREE.Clock()
//Animate
const animate = () => {
  const elapsedTime = clock.getElapsedTime()
  points.rotation.y = elapsedTime * 0.03
  controls.update()
camera.lookAt(earth.position)
  renderer.render(scene, camera)
  window.requestAnimationFrame(animate)
}

animate()

//Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})