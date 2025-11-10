import "./styles.css";
import * as THREE from "three";
import { Room } from "./room";
import { setupPopup } from "./scene/popup";
import { setupControls } from "./scene/controls";
import { setupPostProcessing } from "./scene/postprocessing";
import { setupLights } from "./scene/lights";
import { setupUi } from "./scene/ui";
import { setupInteractions } from "./scene/interactions";

const container = document.getElementById("app")! as HTMLDivElement;
const {
  clientWidth: width = window.innerWidth,
  clientHeight: height = window.innerHeight,
} = container;

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

// Room
const room = new Room();
room.addSynth();
scene.add(room.group);

const { controls } = setupControls(camera, renderer);
const { composer } = setupPostProcessing(
  renderer,
  scene,
  camera,
  width,
  height,
);

setupLights(scene);

setupPopup(container);
setupUi(container);

const { resizeIfNeeded, updateHover } = setupInteractions(
  renderer,
  scene,
  camera,
  container,
  composer,
);

function animate() {
  requestAnimationFrame(animate);

  resizeIfNeeded();
  updateHover();

  controls.update();
  composer.render();
}

animate();
