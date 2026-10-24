
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { pts } from './points'

// Gateway positions: [x, z, y]
// const pts = [
// ];

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x202025)

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Create a point and its text label.
function createPoint(position: number[], label: string) {
  const point = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff4444 })
  )

  point.position.set(position[0], position[1], position[2])
  scene.add(point)

  const canvas = generateLabelCanvas(label)
  const texture = new THREE.CanvasTexture(canvas)

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    })
  )

  sprite.position.set(
    position[0],
    position[1] + 0.45,
    position[2]
  )

  const scale = 0.003
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1)
  sprite.renderOrder = 1

  scene.add(sprite)
}

// Render the label text into a canvas texture.
function generateLabelCanvas(text: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!

  const fontSize = 96
  context.font = `${fontSize}px Arial`


  canvas.width = Math.ceil(context.measureText(text).width + 16)
  canvas.height = fontSize * 1.4

  context.font = `${fontSize}px Arial`
  context.fillStyle = 'white'
  context.textBaseline = 'top'
  context.fillText(text, 4, 4)

  return canvas
}

// Add all points. No lines are drawn.
pts.forEach(pt => {
  createPoint(pt.coordinates, pt.label)
})

// Create the yellow center point at the origin
const centerPoint = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);

// Connect the six directional points to the center
const directions = [
  "Rositz",
  "Pelist",
  "Taeanes-Yutosu",
  "Sehara",
  "Kirthi-Nihall",
  "back"
];

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x0066ff
});

directions.forEach(label => {
  const pt = pts.find(p => p.label === label);

  if (!pt) return;

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(...pt.coordinates)
  ]);

  const line = new THREE.Line(geometry, lineMaterial);
  scene.add(line);
});

centerPoint.position.set(0, 0, 0);
scene.add(centerPoint);

// Calculate the bounding box of all points.
const boundingBox = new THREE.Box3()

pts.forEach(pt => {
  boundingBox.expandByPoint(
    new THREE.Vector3(...pt.coordinates)
  )
})

const center = boundingBox.getCenter(new THREE.Vector3())
const size = boundingBox.getSize(new THREE.Vector3())
const maxDim = Math.max(size.x, size.y, size.z, 1)

// Position the camera far enough away to see every point.
camera.position.set(
  center.x + maxDim * 1.5,
  center.y + maxDim,
  center.z + maxDim * 1.5
)

camera.lookAt(center)
controls.target.copy(center)
controls.update()

// Handle browser resizing.
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

animate()
