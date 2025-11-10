import * as THREE from 'three';
import { showPopupFor, hidePopup } from './popup';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

export function setupInteractions(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, container: HTMLDivElement, composer: EffectComposer) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-10, -10);
  let hoveredObject: THREE.Mesh | null = null;

  // --- Helpers ---
  function getNormalizedMouse(event: MouseEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function applyHighlight(mesh: THREE.Mesh) {
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material || !('emissive' in material)) return;
    if (!mesh.userData._originalEmissive) mesh.userData._originalEmissive = material.emissive.clone();
    material.emissive.set(0x3333ff);
    material.emissiveIntensity = 1.15;
  }

  function restoreHighlight(mesh: THREE.Mesh) {
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material || !('emissive' in material)) return;
    if (mesh.userData._originalEmissive) material.emissive.copy(mesh.userData._originalEmissive);
    material.emissiveIntensity = 1.0;
  }

  // --- Handlers ---
  function onMouseMove(event: MouseEvent) {
    getNormalizedMouse(event);
  }

  function onClick(event: MouseEvent) {
    getNormalizedMouse(event);
    raycaster.setFromCamera(mouse, camera);
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

  function updateHover() {
    // Early exit if pointer out of bounds
    if (mouse.x < -1 || mouse.x > 1 || mouse.y < -1 || mouse.y > 1) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let newHovered: THREE.Mesh | null = null;
    if (intersects.length > 0) {
      const firstHit = intersects[0].object as THREE.Mesh;
      if (firstHit.userData?.clickable) newHovered = firstHit;
    }

    if (hoveredObject !== newHovered) {
      if (hoveredObject) restoreHighlight(hoveredObject);
      if (newHovered) applyHighlight(newHovered);
      hoveredObject = newHovered;
      renderer.domElement.style.cursor = hoveredObject ? 'pointer' : 'default';
    }
  }

  function resizeIfNeeded() {
    const canvas = renderer.domElement;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }


  // --- Attach listeners ---
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('click', onClick);

  // --- Public API ---
  return { updateHover, resizeIfNeeded };
}
