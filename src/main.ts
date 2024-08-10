import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'

// Define the points with labels and coordinates
const pts = [ // swapped z with y
  { label: "Angyuan-Raha XIX", coordinates: [0, 0, 0] },
  { label: "Iawshea-Yook", coordinates: [105, 0, 0] },
  { label: "Nuuraya", coordinates: [63.77, 75.57, -240.50] },
  { label: "Rudoin-Blosa", coordinates: [7.12, -173.49, -315.36] },
  { label: "Uooyiiji", coordinates: [30.18, -4.00, 12.73] },
  { label: "Taotie", coordinates: [148.96, -89.93, -157.96] }
];
console.log(pts);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);

// Function to create a point
function createPoint(position: number[], label: string) {
  const pointGeometry = new THREE.SphereGeometry(5, 32, 32); // Radius set to 5
  const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const point = new THREE.Mesh(pointGeometry, pointMaterial);
  point.position.set(position[0], position[1], position[2]);

  const canvas = generateLabelCanvas(label);
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(position[0], position[1] + 12, position[2]); // Position label further above the dot

  // Scale the sprite based on the canvas size and reduce it by half
  const spriteScale = 0.05; // Adjusted to half the previous factor (0.1 / 2)
  sprite.scale.set(canvas.width * spriteScale, canvas.height * spriteScale, 1);

  // Ensure the sprite renders in front of the dot
  sprite.renderOrder = 999;
  point.renderOrder = 998;

  scene.add(point);
  scene.add(sprite);
}

// Function to generate canvas for label
function generateLabelCanvas(text: string): HTMLCanvasElement {
  const fontSize = 192; // 24 * 8 to make it 8 times bigger
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  // Estimate text width to set canvas dimensions
  context.font = `${fontSize}px Arial`;
  const textWidth = context.measureText(text).width;

  canvas.width = textWidth;
  canvas.height = fontSize * 1.2; // Add some padding for the height

  // Draw the text
  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'white';
  context.fillText(text, 0, fontSize);

  return canvas;
}

// Add points to the scene
pts.forEach(pt => {
  createPoint(pt.coordinates, pt.label);
});

// Function to create a line between two points
function createLine(p1: number[], p2: number[]) {
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(p1[0], p1[1], p1[2]),
    new THREE.Vector3(p2[0], p2[1], p2[2])
  ]);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

// Add lines between consecutive points
for (let i = 0; i < pts.length - 1; i++) {
  createLine(pts[i].coordinates, pts[i + 1].coordinates);
}

// Calculate bounding box
const boundingBox = new THREE.Box3();
pts.forEach(pt => {
  boundingBox.expandByPoint(new THREE.Vector3(pt.coordinates[0], pt.coordinates[1], pt.coordinates[2]));
});

const boundingBoxSize = boundingBox.getSize(new THREE.Vector3());
const boundingBoxCenter = boundingBox.getCenter(new THREE.Vector3());

// Set the camera position to fit all points
const maxDim = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
const fov = camera.fov * (Math.PI / 180); // convert vertical fov to radians
let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

// Offset the camera further to ensure all points are in view
cameraZ *= 1.2;

camera.position.set(boundingBoxCenter.x, boundingBoxCenter.y, cameraZ);
camera.lookAt(boundingBoxCenter);

// Set the OrbitControls target to the center of the bounding box
controls.target.copy(boundingBoxCenter);
controls.update();

const stats = new Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'z', 0, 2000);
cameraFolder.open();

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  stats.update();
}

animate();
