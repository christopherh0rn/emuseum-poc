export function setupUi(container: HTMLDivElement) {
  const ui = document.createElement("div");
  ui.className = "ui";
  ui.innerHTML = "<strong>eMuseum - PoC</strong><br>Use mouse to orbit";
  container.appendChild(ui);
}
