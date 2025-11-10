import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Room {
  group: THREE.Group;
  private panelMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.panelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#45dd75"),
      emissive: new THREE.Color("#45dd75"),
      emissiveIntensity: 0.2, // makes panels glow
      metalness: 0.05,
      roughness: 1.6,
    });

    // Build room geometry: large box with flipped normals
    const roomWidth = 8,
      roomHeight = 4,
      roomDepth = 16;
    const boxGeo = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
    // We'll create materials per side to control panels
    const materials = [];

    // Generate side materials: [right, left, top, bottom, back, front]
    materials.push(this.panelMaterial); // right wall
    materials.push(this.panelMaterial); // left wall
    materials.push(new THREE.MeshStandardMaterial({ color: 0x0b0b0b })); // ceiling
    materials.push(new THREE.MeshStandardMaterial({ color: 0x080808 })); // floor (we will replace with reflector)
    materials.push(this.panelMaterial); // back wall (far end)
    materials.push(this.panelMaterial); // front (entrance)

    const roomMesh = new THREE.Mesh(boxGeo, materials);

    // Flip normals so the box is visible from inside
    for (const mat of materials) {
      mat.side = THREE.BackSide;
    }

    roomMesh.position.y = roomHeight / 2 - 0.1;
    this.group.add(roomMesh);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomDepth),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.1,
        metalness: 0.7,
        roughness: 0.05,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.group.add(floor);

    const grid = new THREE.GridHelper(8, 8, 0x45dd75, 0x45dd75);
    grid.position.y = 0.02; // slightly above floor
    this.group.add(grid);

    // Subtle ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    this.group.add(ambient);
  }

  async addSynth() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("/assets/garys_synthesizer/scene.gltf");

    const synth = gltf.scene;
    synth.scale.set(0.2, 0.2, 0.2);
    synth.position.set(0, 1, 0);

    synth.name = "garys_synth";
    synth.userData = {
      label: "Gary's Synthesizer",
      description:
        "A 1970s modular synthesizer used in experimental sound design.",
      clickable: true,
    };

    // Mark all meshes inside as clickable and store metadata
    synth.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.userData = synth.userData;
      }
    });

    this.group.add(synth);
  }
}
