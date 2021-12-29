import { logNow } from "/lib/log.js";
import _ from "/lib/free.js";
import { visit } from "/lib/net.js";
import { choose } from "/lib/random.js";
import { getSharedState } from "/lib/shared-state.js";

// FIXME no player or bitnode stats for now, but fine for relative calculations
// note that we calculate at steady-state of strategy, not at present
export function hackMoney(ns, node, present = false)
{
  const balanceFactor = 240;
  const hacking_money_mult = 1; // player mult TBD
  const script_hack_money = 1; // bitnode TBD
  
  const difficultyMult = (100 - (present ? node.security : node.minSecurity)) / 100;
  const hacking = ns.getHackingLevel();
  const skillMult = (hacking - (node.requiredHackingLevel - 1)) / hacking;
  const percentMoneyHacked = (difficultyMult * skillMult * hacking_money_mult) / balanceFactor;
  if (percentMoneyHacked < 0) {
    return 0;
  }
  if (percentMoneyHacked > 1) {
    return 1;
  }
  
  return percentMoneyHacked * script_hack_money * node.maxMoney;
}

// FIXME intelligence
// note that by default we calculate at steady-state of strategy, not at present
export function hackTime(ns, node, present = false) {
  const difficultyMult = node.requiredHackingLevel * (present ? node.security : node.minSecurity);
  const hacking_speed_mult = 1; // player mult TBD
  const intelligence = 1; // calculateIntelligenceBonus(player.intelligence, 1)
  const baseDiff = 500;
  const baseSkill = 50;
  const diffFactor = 2.5;
  let skillFactor = diffFactor * difficultyMult + baseDiff;

  skillFactor /= ns.getHackingLevel() + baseSkill;

  const hackTimeMultiplier = 5;
  const hackingTime =
    (hackTimeMultiplier * skillFactor) /
    (hacking_speed_mult * intelligence);

  return hackingTime;
}

export async function bestActionAt(ns, node, securityThresh = 1.5, moneyThresh = 0.5)
{
  await logNow(ns);
  if (node.security > node.minSecurity * securityThresh) {
    // while security too high, weaken
    await ns.weaken(node.name);
  } else if (node.money < node.maxMoney * moneyThresh) {
    // while too poor, grow
    await ns.grow(node.name);
  } else {
    await ns.hack(node.name);
  }
}

function clamp(v, [min, max])
{
  return Math.max(min, Math.min(v, max));
}

function delerp(v, [min, max])
{
  return (v - min) / (max - min);
}

export async function bestTarget(ns)
{
  const nodes = [];
  
  await visit(ns, (node) => {
    nodes.push(node);
  });
  return nodes.maxBy(node => hackMoney(ns, node) / hackTime(ns, node));
}

export function randomizedActionWeights(
  ns, node, securityT = [1.1, 1.5], moneyT = [0.7, 0.9],
)
{
  const [mL, mH] = moneyT;
  const [sL, sH] = securityT;

  securityT = [sL * node.minSecurity, sH * node.minSecurity];
  moneyT = [mL * node.maxMoney, mH * node.maxMoney];
    
  // moneyU in [0, 1]: 0 -> server is poor, we all grow
  //                   1 -> server is rich, we all steal

  // but we do neither if security is too high;
  
  const mU = clamp(delerp(node.money, moneyT), [0, 1]);
  const sU = clamp(delerp(node.security, securityT), [0, 1]);
  
  const weakenW = sU;
  const growW = (1 - sU) * (1 - mU);
  const hackW = (1 - sU) * mU;

  // currently w == 1 by construction, but this will change when we
  // futz around with importances later
  
  const w = weakenW + hackW + growW;

  const hackP = hackW / w,
        weakenP = weakenW / w,
        growP = growW / w;
  
  return {
    hack: hackP,
    weaken: weakenP,
    grow: growP
  };
}

export async function randomizedBestActionAt(
  ns, node, securityT = [1.1, 1.5], moneyT = [0.7, 0.9]
)
{
  async function setLog(action, log) {
    const ss = getSharedState(ns, "monitor-loic-queue");
    let backoff = 0;
    while (ss.queue === undefined) {
      await ns.sleep(Math.random() * (1 << (backoff++)));
    }
    let queue = ss.queue;
    const host = ns.getHostname();
    const script = ns.getRunningScript();
    const mult = {
      "hack": 1,
      "weaken": 4,
      "grow": 3.2
    };
    queue.push({
      host: node.name,
      log,
      id: `${host}:${script.filename}:${script.args}`,
      what: action,
      threads: script.threads,
      duration: mult[action] * hackTime(ns, node, true) * 1000
    });
  }
  const {
    hack: hackP,
    weaken: weakenP,
    grow: growP
  } = randomizedActionWeights(ns, node, securityT, moneyT);
  
  switch (choose([1, 9]) === 1 ?
          choose([0.1,10,3.2]) :
          choose([hackP, weakenP, growP])) {

  case 0:
    await setLog("hack", "start");
    await ns.hack(node.name);
    await setLog("hack", "end");
    break;
  case 1:
    await setLog("weaken", "start");
    await ns.weaken(node.name);
    await setLog("weaken", "end");
    break;
  case 2:
    await setLog("grow", "start");
    await ns.grow(node.name);
    await setLog("grow", "end");
    break;
  default:
    throw new Error("never gets here");
  }
}
