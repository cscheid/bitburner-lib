import { logNow } from "/lib/log.js";
import _ from "/lib/free.js";
import { visit } from "/lib/net.js";
import { choose } from "/lib/random.js";

// FIXME no player or bitnode stats for now, but fine for relative calculations
// note that we calculate at steady-state of strategy, not at present
export function hackMoney(ns, node)
{
  const balanceFactor = 240;
  const hacking_money_mult = 1; // player mult TBD
  const script_hack_money = 1; // bitnode TBD
  
  const difficultyMult = (100 - node.security) / 100;
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
// note that we calculate at steady-state of strategy, not at present
export function hackTime(ns, node) {
  const difficultyMult = node.requiredHackingLevel * node.minSecurity;
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
  return (min - v) / (max - min);
}

export async function bestTarget(ns)
{
  const nodes = [];
  
  await visit(ns, (node) => {
    nodes.push(node);
  });
  return nodes.maxBy(node => hackMoney(ns, node) / hackTime(ns, node));
}

export async function randomizedBestActionAt(
  ns, node, securityT = [1.1, 1.5], moneyT = [0.7, 0.9],
  log = {}
)
{
  const [mL, mH] = moneyT;
  const [sL, sH] = securityT;
  
  const mFraction = node.money / node.maxMoney;
  const sFraction = node.security / node.maxSecurity;
  
  // moneyU in [0, 1]: 0 -> server is poor, we all grow
  //                   1 -> server is rich, we all steal

  // but we do neither if security is too high;
  
  const mU = clamp(delerp(mFraction, moneyT), moneyT);
  const sU = clamp(delerp(sFraction, securityT), securityT);
  
  const weakenW = sU;
  const hackW = (1 - sU) * mU;
  const growW = (1 - sU) * (1 - mU);

  // currently w == 1 by construction, but this will change when we
  // futz around with importances later
  
  const w = weakenW + hackW + growW;

  const hackP = hackW / w,
        weakenP = hackP + weakenW / w,
        growP = growW / w;

  function setLog(action) {
    const host = ns.getHostname();
    log[host] = {
      host,
      action,
      time: (new Date()).toISOString(),
    };
  }

  switch (choose([1, 9]) === 1 ?
          choose([1,1,1]) :
          choose([hackP, weakenP, growP])) {

  case 0:
    setLog("hack");
    await ns.hack(node.name);
    break;
  case 1:
    setLog("weaken");
    await ns.weaken(node.name);
    break;
  case 2:
    setLog("grow");
    await ns.grow(node.name);
    break;
  default:
    throw new Error("never gets here");
  }
}
