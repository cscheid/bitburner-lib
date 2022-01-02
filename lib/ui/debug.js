// Our own diagnostics monitor

function ensureInit()
{
  let doc = globalThis['document'];
  if (doc.getElementById("bl-debug") !== null) {
    return;
  }
  
  let root = doc.createElement("div");
  root.style.position = "fixed";
  root.style.left = "20px";
  root.style.top = "20px";
  root.style.width = "calc(100vw - 40px)";
  root.style.height = "calc(100px)";
  root.style.background = "rgb(0, 0, 50)";

  doc.body.appendChild(root);
}

export function createDebugElement()
{
  ensureInit();
}
