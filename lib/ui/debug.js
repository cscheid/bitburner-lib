//global import
// Our own diagnostics monitor

let doc = globalThis['document'];

async function ensureDiv()
{
  let module = await import('https://cdn.skypack.dev/d3');
  debugger;
  
  if (doc.getElementById("bl-debug") !== null) {
    return doc.getElementById("bl-debug");
  }
  
  let root = doc.createElement("div");
  root.id = "bl-debug";
  root.style.position = "fixed";
  root.style.left = "80px";
  root.style.top = "20px";
  root.style.width = "calc(100vw - 100px)";
  root.style.height = "calc(100px)";
  root.style.background = "rgb(30, 30, 30)";

  let mainEl = doc.createElement("div");
  mainEl.id = "bl-debug-main";
  root.appendChild(mainEl);

  root.style.position = "absolute";
  root.style.bottom = "20px";

  doc.body.appendChild(root);

  return root;
}

export function clearDebug()
{
  ensureDiv();
  doc.getElementById("");
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
