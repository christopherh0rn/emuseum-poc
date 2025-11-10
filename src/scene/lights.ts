import * as THREE from 'three';

export function setupLights(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4);

  const key = new THREE.PointLight(0xffdcb2, 1.0, 20);
  key.position.set(0, 3.0, -4);

  const spot = new THREE.PointLight(0xffdcb2, 1.0, 20);
  spot.position.set(0, 0, 4);

  const directional = new THREE.DirectionalLight(0xffffff, 0.6);
  directional.position.set(0, 5, 0); // above the room
  directional.target.position.set(0, 0, 0);
  
  const synthLight = new THREE.PointLight(0xffffff, 0.5, 5);
  synthLight.position.set(0, 1.5, 0);
  
  scene.add(hemi, key, spot, directional, directional.target, synthLight);

  return { hemi, key, spot, directional, synthLight };
}
