// Our own diagnostics monitor

function ensureDiv()
{
  let doc = globalThis['document'];
  if (doc.getElementById("bl-debug") !== null) {
    return doc.getElementById("bl-debug");
  }
  
  let root = doc.createElement("div");
  root.style.position = "fixed";
  root.style.left = "80px";
  root.style.top = "20px";
  root.style.width = "calc(100vw - 100px)";
  root.style.height = "calc(100px)";
  root.style.background = "rgb(0, 0, 50)";

  doc.body.appendChild(root);

  return root;
}

export function createDebugElement()
{
  ensureDiv();
}

export function showDebug()
{
  let root = ensureDiv();
  root.style.display = null;
}

export function hideDebug()
{
  let root = ensureDiv();
  root.style.display = "none";
}
