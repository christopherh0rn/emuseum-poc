import './styles.css';
import * as THREE from 'three';
import { Room } from './room';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = document.getElementById('app')!;
const width = container.clientWidth || window.innerWidth;
const height = container.clientHeight || window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

// Scene & Camera
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(new THREE.Color(0x000000), 0.02);

const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
camera.position.set(0, 1.5, 6);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.minDistance = 1.5;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2.1;
controls.update();

// Room
const room = new Room();
scene.add(room.group);

// Lights (accent + fill)
const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4);
scene.add(hemi);

const key = new THREE.PointLight(0xffdcb2, 1.0, 20);
key.position.set(0, 3.0, -4);
scene.add(key);

const spot = new THREE.PointLight(0xffdcb2, 1.0, 20);
spot.position.set(0, 0, 4);
scene.add(spot);

const directional = new THREE.DirectionalLight(0xffffff, 0.6);
directional.position.set(0, 5, 0); // above the room
directional.target.position.set(0, 0, 0);
scene.add(directional);
scene.add(directional.target);

const synthLight = new THREE.PointLight(0xffffff, 0.5, 5);
synthLight.position.set(0, 1.5, 0);
scene.add(synthLight);

// Postprocessing (bloom)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.9, 0.4, 0.1);
bloom.threshold = 0.2;
bloom.strength = 0.8;
bloom.radius = 0.7;
composer.addPass(bloom);

// UI
const ui = document.createElement('div');
ui.className = 'ui';
ui.innerHTML = '<strong>eMuseum - PoC</strong><br>Use mouse to orbit';
container.appendChild(ui);

// Popup
const popup = document.createElement('div');
popup.className = 'popup';
popup.style.position = 'absolute';
popup.style.background = 'rgba(255,255,255,0.9)';
popup.style.color = '#000';
popup.style.padding = '8px 12px';
popup.style.borderRadius = '6px';
popup.style.pointerEvents = 'none';
popup.style.display = 'none';
popup.style.transition = 'opacity 0.2s';

const popupTitle = document.createElement('h2');
popup.appendChild(popupTitle);
const popupDesc = document.createElement('p');
popup.appendChild(popupDesc);

container.appendChild(popup);

function showPopupFor(object: THREE.Object3D, x: number, y: number) {
  if (!object?.userData?.label) return;

  popupTitle.textContent = object.userData.label;
  popupDesc.textContent = object.userData.description;
  popup.style.left = `${x + 10}px`;
  popup.style.top = `${y + 10}px`;
  popup.style.display = 'block';
  popup.style.opacity = '1';
}

function hidePopup() {
  popup.style.opacity = '0';
  popup.style.display = 'none';
}

// Resize handling
window.addEventListener('resize', onResize);
function onResize() {
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-10, -10);

let hoveredObject: THREE.Mesh | null = null;

renderer.domElement.addEventListener('mousemove', onMouseMove);

function onMouseMove(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}


renderer.domElement.addEventListener('click', onClick);

function onClick(event: MouseEvent) {
  // Convert to normalized device coordinates (-1 to +1)
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Find intersections with all children of the scene
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const firstHit = intersects[0].object;
    if (firstHit.userData?.clickable) {
      showPopupFor(firstHit, event.clientX, event.clientY);
    } else {
      hidePopup();
    }
  } else {
    hidePopup();
  }
}

function applyHighlight(mesh: THREE.Mesh) {
  const material = mesh.material as THREE.MeshStandardMaterial;
  if (!material || !('emissive' in material)) return;

  // Save original color if not already saved
  if (!mesh.userData._originalEmissive) mesh.userData._originalEmissive = material.emissive.clone();

  material.emissive.set(0x3333ff); // light blue glow
  material.emissiveIntensity = 1.15;
}

function restoreHighlight(mesh: THREE.Mesh) {
  const material = mesh.material as THREE.MeshStandardMaterial;
  if (!material || !('emissive' in material)) return;

  if (mesh.userData._originalEmissive) {
    material.emissive.copy(mesh.userData._originalEmissive);
  }
  material.emissiveIntensity = 1.0;
}

function updateHover() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  let newHovered: THREE.Mesh | null = null;

  if (intersects.length > 0) {
    const firstHit = intersects[0].object as THREE.Mesh;
    if (firstHit.userData?.clickable) {
      newHovered = firstHit;
    }
  }

  // Only update highlight if the hovered object changed
  if (hoveredObject !== newHovered) {
    // Restore previous
    if (hoveredObject) restoreHighlight(hoveredObject);
    // Apply highlight to new
    if (newHovered) applyHighlight(newHovered);

    hoveredObject = newHovered;

    if (hoveredObject) {
      renderer.domElement.style.cursor = 'pointer';
    } else {
      renderer.domElement.style.cursor = 'default';
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  updateHover();

  composer.render();
}

animate();
