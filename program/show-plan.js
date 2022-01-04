import {planLoop} from "/lib/planner.js";

/** @param {NS} ns **/
export async function main(ns) {
  let budget;
  if (ns.args[2] === undefined)
    budget = Math.floor(ns.getServer(ns.args[1]).maxRam / 1.75);
  else
    budget = Number(ns.args[2]);
  let plan = await planLoop(ns, ns.getServer(ns.args[0]), ns.getServer(ns.args[1]), budget, 0.00001);

  let hackCorrected = plan.maxReward.hack / 4;
  let growCorrected = plan.maxReward.grow / (4 / 3.2);
  
  let sum = hackCorrected + growCorrected + plan.maxReward.weaken;

  let ww = plan.maxReward.weaken / sum;
  let gw = growCorrected / sum;
  let hw = hackCorrected / sum;

  let wb = Math.ceil(ww * budget);
  let gb = Math.ceil(gw * budget);
  let hb = budget - gb - wb;

  ns.tprint(`Weights:`);
  ns.tprint(JSON.stringify({hack: ww, grow: gw, weaken: hw}));

  ns.tprint(`Budget:`);
  ns.tprint(JSON.stringify({hack: hb, grow: gb, weaken: wb}));

  ns.tprint(JSON.stringify(plan.maxReward, null, 2));
  ns.tprint(`Expected efficiency: ${plan.maxReward.reward / plan.maxReward.time}/s`);
}
