import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { formatTable } from "/lib/fmt.js";
import { hackMoney, hackTime } from "/lib/hack.js";
import { planLoop } from "/lib/planner.js";
import { chart } from "/lib/ui/debug.js";

/** @param {NS} ns */
export async function main(ns) {
  debugger;
  let hosts = [];
  let hack = ns.getHackingLevel();
  let host = ns.getServer(ns.args[0]);
  let budget = Math.floor(host.maxRam / 1.75);
  ns.tprint(`Budget: ${budget}`);
  
  let plans = {};
  let rewards = [];
  let efficiencies = [];
  
  const fmt = (v) => {
    if (v > 1e15) {
      return String(Math.round(v / 1e12) / 1000) + "q";
    }
    if (v > 1e12) {
      return String(Math.round(v / 1e9) / 1000) + "t";
    }
    if (v > 1e9) {
      return String(Math.round(v / 1e6) / 1000) + "b";
    }
    if (v > 1e6) {
      return String(Math.round(v / 1e3) / 1000) + "m";
    }
    return String(Math.round(v * 1000) / 1000);
  };
  const evaltime = {};  
  await visit(ns, async (target) => {
    if (target.requiredHackingLevel > hack || !target.hasRootAccess ||
        target.maxMoney === 0)
      return;
    hosts.push(target);
    let s = ns.getServer(target.name);
    if (ns.args[ns.args.length - 1] !== "-n")
      s.moneyAvailable = s.moneyMax;
    let before = performance.now();
    let plan = await planLoop(ns, s, host, budget, 0.00001);
    plans[target.name] = plan.maxReward;
    let after = performance.now();
    rewards.push(...plan.rewards);
    efficiencies.push(...plan.efficiencies);
    evaltime[target.name] = after - before;
  });

  hosts.sort((a, b) => {
    a = plans[a.name];
    b = plans[b.name];
    return a.reward / a.time - b.reward / b.time;
  });

  const out = [["name", "minsec", "sec", "maxmoney", "money", "reward", "evaltime", "ht", "wt", "gt"]];
  hosts.forEach(host => {
    let p = plans[host.name];
    out.push([host.name,
              fmt(host.minSecurity),
              fmt(host.security),
              fmt(host.maxMoney),
              fmt(host.money),
              fmt(p.reward / p.time),
              fmt(evaltime[host.name]),
              fmt(p.hack),
              fmt(p.weaken),
              fmt(p.grow),
             ]);
  });

  chart({
    "width": 800,
    "height": 400,
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "hack vs efficiency",
    "data": { values: efficiencies.filter(d => d.hostname === "n00dles") },
    "mark": {
      "type": "line"
    },
    "encoding": {
      "x": { "field": "hack", "type": "quantitative" },
      "y": { "field": "value", "type": "quantitative" },
//      "color": {"field": "hostname", "type": "nominal"}
    }
  });
  
  ns.tprint("\n\n" + formatTable(out));
}
