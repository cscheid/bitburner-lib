import * as formulas from "/lib/bb/formulas.js";
import { grow, hack, weaken } from "/lib/bb/simulator.js";
import { CONSTANTS } from "/lib/bb/constants.js";

export async function evaluatePlan(ns, { target, player, host, plan })
{
  // probably enough to do a shallow copy..
  target = JSON.parse(JSON.stringify(target));

  let dispatch = {
    "grow": grow,
    "weaken": weaken,
    "hack": hack
  };

  for (const step of plan) {
    if (step.grow) {
      await grow(ns, { server: target, host, threads: step.grow, player });
    }
    if (step.weaken) {
      await weaken(ns, { server: target, host, threads: step.weaken, player });
    }
    if (step.hack) {
      await hack(ns, { server: target, host, threads: step.hack, player });
    }
  }
  return {
    target,
    player
  };
}

// Plan:
//   - Bootstrap: 
//     - grow the server until it's at max money
//     - weaken the server until it's at min
//     schedule these two to happen concurrently so weaken doesn't happen at a worse time.

//   - Loop:
//     - steal "enough money but not too much"
//     - regrow money until it's at max
//     - weaken the server until it's at min
//     schedule these three to happen concurrently so grow and weaken take time proportional to min security.

// "Enough money" is based on a combination of
//
// - our available thread pool
// - The server's max money
//
// we always steal enough money to regrow it back to max in the same round.

export async function planBootstrap(ns, target, host, budget)
{
  if (budget < 2) {
    throw new Error("need budget >= 2");
  }
  
  let targetServer;
  if (typeof target === "string") {
    targetServer = await ns.getServer(target);
  } else {
    targetServer = Object.assign({}, target);
  }
  let player = ns.getPlayer();
  let hostServer;
  if (typeof host === "string") {
    hostServer = await ns.getServer(host);
  } else {
    hostServer = Object.assign({}, host);
  }

  const coreBonus = 1 + (host.cpuCores - 1) / 16;
  let securityPerWeaken = CONSTANTS.ServerWeakenAmount * coreBonus;
  let securityPerGrow = CONSTANTS.ServerFortifyAmount;
  let growthAmount = targetServer.moneyMax / Math.max(targetServer.moneyAvailable, 1);

  let neededGrowthCycles = Math.ceil(formulas.numCycleForGrowth(ns, targetServer, growthAmount, player, host.cpuCores));
  let neededWeakenCycles = Math.ceil(targetServer.hackDifficulty - targetServer.minDifficulty) +
      Math.ceil(neededGrowthCycles * securityPerGrow / securityPerWeaken);

  if (neededGrowthCycles + neededWeakenCycles > budget) {
    // low-budget bootstrap mode. First we weaken serially until security is low,
    // then we serially grow as much as we can while maintaining minimum security
    if (neededWeakenCycles > 0) {
      weaken(ns, { server: targetServer, host, threads: budget });
      return [{
        weaken: budget
      }, ...planBootstrap(ns, targetServer, host, budget)];
    } else {
      let growPerWeaken = securityPerWeaken / securityPerGrow;
      let r = growPerWeaken, s = budget;
      let weakenAmount = Math.ceil(s / (r + 1));
      let growAmount = budget - weakenAmount;
      grow(ns, { targetServer, host, threads: growAmount });
      weaken(ns, { targetServer, host, threads: weakenAmount });
      return [{
        grow: growAmount,
      }, {
        weaken: weakenAmount
      }, ...planBootstrap(ns, targetServer, host, budget)];
    }
  } else {
    return [{
      grow: neededGrowthCycles,
      weaken: neededWeakenCycles
    }];
  }
}

export async function planLoop(ns, target, host, budget)
{
  
  let targetServer;
  if (typeof target === "string") {
    targetServer = await ns.getServer(target);
  } else {
    targetServer = Object.assign({}, target);
  }
  let player = ns.getPlayer();
  let hostServer;
  if (typeof host === "string") {
    hostServer = await ns.getServer(host);
  } else {
    hostServer = Object.assign({}, host);
  }

  targetServer.moneyAvailable = targetServer.moneyMax;
  targetServer.hackDifficulty = targetServer.minDifficulty;

  let result = [];
  let pct = formulas.calculatePercentMoneyHacked(ns, targetServer, player);
  let maxThreads = Math.ceil((1 / pct) * (targetServer.moneyAvailable / targetServer.moneyMax));

  // for every possible number of threads, compute how many grow and weaken threads will
  // be necessary to bring server back to the original state,
  let growThreads = 1;
  let maxReward = 0;
  
  // never reset growthreads because it grows monotonically as i grows
  // this speeds up the code enormously.
  let chance = formulas.calculateHackingChance(ns, targetServer, player);
  for (let i = 0; i <= maxThreads; ++i) {
    let cp = Object.assign({}, targetServer);
    let reward = hack(ns, { server: cp, threads: i, player });
    reward *= chance;

    let growTime;
    for (; growThreads < budget; ++growThreads) {
      let cp2 = Object.assign({}, cp);
      grow(ns, { server: cp2, threads: growThreads, player, host });
      let newMoney = cp2.moneyAvailable;
      if (newMoney === targetServer.moneyAvailable) {
        cp = cp2;
        break;
      }
    }
    if (growThreads === budget) {
      break;
    }
    const coreBonus = 1 + (host.cpuCores - 1) / 16;
    let weakenThreads = Math.ceil(
      (cp.hackDifficulty - cp.minDifficulty) /
        (CONSTANTS.ServerWeakenAmount * coreBonus));

    if (reward > maxReward) {
      maxReward = reward;
      result = {
        reward,
        hack: i,
        grow: growThreads,
        weaken: weakenThreads
      };
    }

    if (i + growThreads + weakenThreads > budget) {
      break;
    }
  }
  return result;
}

