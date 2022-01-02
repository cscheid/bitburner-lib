let doc = globalThis['document'];

function scriptTag(src)
{
  let script = doc.createElement("script");
  script.src = src;
  return script;
}

export function ensureVl()
{
  return Promise.all([
    "https://cdn.jsdelivr.net/npm/vega@5.21.0",
    "https://cdn.jsdelivr.net/npm/vega-lite@5.2.0",
    "https://cdn.jsdelivr.net/npm/vega-embed@6.20.2"
  ].map(scriptTag).map(tag => new Promise((resolve, reject) => {
    tag.onload = resolve;
    doc.head.appendChild(tag);
  })));
}
