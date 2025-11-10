import * as THREE from 'three';

let popup: HTMLDivElement, popupDesc: HTMLParagraphElement, popupTitle: HTMLHeadingElement;

export function setupPopup(container: HTMLDivElement) {
  popup = document.createElement('div');
  popup.className = 'popup';
  popup.style.position = 'absolute';
  popup.style.background = 'rgba(255,255,255,0.9)';
  popup.style.color = '#000';
  popup.style.padding = '8px 12px';
  popup.style.borderRadius = '6px';
  popup.style.pointerEvents = 'none';
  popup.style.display = 'none';
  popup.style.transition = 'opacity 0.2s';

  popupTitle = document.createElement('h2');
  popup.appendChild(popupTitle);
  popupDesc = document.createElement('p');
  popup.appendChild(popupDesc);

  container.appendChild(popup);

  return { popup, popupTitle, popupDesc };
}

export function showPopupFor(object: THREE.Object3D, x: number, y: number) {
  if (!object?.userData?.label) return;

  popupTitle.textContent = object.userData.label;
  popupDesc.textContent = object.userData.description;
  popup.style.left = `${x + 10}px`;
  popup.style.top = `${y + 10}px`;
  popup.style.display = 'block';
  popup.style.opacity = '1';
}

export function hidePopup() {
  popup.style.opacity = '0';
  popup.style.display = 'none';
}
