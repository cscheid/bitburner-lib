import { require } from "/lib/skypack.js";
import { ensureVl } from "/lib/ui/vl.js";

// Our own diagnostics monitor

const doc = globalThis['document'];
const win = globalThis['window'];

async function ensureDiv()
{
  const d3 = await require('d3');
  
  if (doc.getElementById("bl-debug") !== null) {
    return doc.getElementById("bl-debug");
  }

  const style = doc.createElement("style");
  style.innerText = `
.bl-debug {
  color: white;
}
.bl-debug pre {
  margin-left: 0.2em;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
}
`;
  doc.head.appendChild(style);
  
  const rootDiv = d3.select("body")
      .append("div")
      .attr("id", "bl-debug")
      .style("position", "fixed")
      .style("left", "80px")
      .style("top", "20px")
      .style("width", "calc(100vw - 100px)")
      .style("height", "300px")
      .style("background", "rgb(30, 30, 30)");

  rootDiv.append("div")
    .attr("id", "bl-debug-main")
    .classed("bl-debug", true)
    .style("position", "absolute")
    .style("display", "block")
    .style("height", "260px")
    .style("overflow-y", "auto")
    .style("overflow-x", "hidden")
    .style("left", "20px")
    .style("bottom", "20px");

  return rootDiv.node();
}

export async function createDebugElement()
{
  await ensureDiv();
}

export async function clearDebug()
{
  await ensureDiv();
  const d3 = await require('d3');
  d3.select("#bl-debug-main").selectAll("*").remove();
}

export async function showDebug()
{
  const root = await ensureDiv();
  root.style.display = null;
}

export async function hideDebug()
{
  const root = await ensureDiv();
  root.style.display = "none";
}

export async function add(el)
{
  const d3 = await require('d3');
  d3.select("#bl-debug-main").node().appendChild(el);
}

export function scrollToBottom()
{
  const div = doc.getElementById("bl-debug-main");
  div.scrollTop = div.scrollHeight;
}

let reportLevel = 0;
let doScroll = true;
export async function msg(ns, msg, level = 0)
{
  if (level < reportLevel) {
    return;
  }
  await ensureDiv();
  let pre = doc.createElement("pre");
  pre.innerText = msg;
  add(pre);
  if (!doScroll)
    return;
  await new Promise((resolve) => {
    globalThis['window'].requestAnimationFrame(resolve);
  });
  scrollToBottom();
}

export async function scrollOn()
{
  doScroll = true;
}

export async function scrollOff()
{
  doScroll = false;
}

export async function chart(spec)
{
  await ensureDiv();
  
  await require("vega");
  await require("vega-lite");
  const vegaEmbed = (await require("vega-embed")).default;
  const d3 = await require('d3');
  
  const node = d3.select("#bl-debug-main")
      .append("div")
      .style("display", "block")
      .node();

  const result = await vegaEmbed(node, spec);
  scrollToBottom();
  
  return result;
}
