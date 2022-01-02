import { require } from "/lib/skypack.js";
import { ensureVl } from "/lib/ui/vl.js";

// Our own diagnostics monitor

let doc = globalThis['document'];
let win = globalThis['window'];

async function ensureDiv()
{
  let d3 = await require('d3');
  
  if (doc.getElementById("bl-debug") !== null) {
    return doc.getElementById("bl-debug");
  }
  
  let rootDiv = d3.select("body")
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
    .style("position", "absolute")
    .style("height", "300px")
    .style("overflow-y", "auto")
    .style("overflow-x", "hidden")
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
  let d3 = await require('d3');
  d3.select("#bl-debug-main").selectAll("*").remove();
}

export async function showDebug()
{
  let root = await ensureDiv();
  root.style.display = null;
}

export async function hideDebug()
{
  let root = await ensureDiv();
  root.style.display = "none";
}

export async function add(el)
{
  let d3 = await require('d3');
  d3.select("#bl-debug-main").append(el);
}

export async function chart(spec)
{
  debugger;
  // await ensureVl();
  await require("vega");
  await require("vega-lite");
  let vegaEmbed = (await require("vega-lite")).default;
  let d3 = await require('d3');
  
  let node = d3.select("#bl-debug-main")
      .append("div")
      .style("layout", "block")
      .node();

  let result = await vegaEmbed(node, spec);
  return result;
}
