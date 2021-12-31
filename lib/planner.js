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

export async function planner(ns, target, host)
{
  // Plan:
  //   - Bootstrap: 
  //     - weaken the server until it's at min
  //     - grow the server until it's at max money
  //   - Loop:
  //     - weaken the server until it's at min
  //     - steal "enough money but not too much"
  //     - regrow money until it's at max

  // "Enough money" is based on a combination of
  //
  // - our available thread pool
  // - The server's max money
  // - we pick it via root-finding using the formulas

  // we set up the timing so that these can happen right after one
  // another by using the timing formulas and delaying hack invocations

  // the fact that we plan for the future and schedule is the reason
  // we can't call the ns functions, because the server will have
  // changed by then (presumably the player might have too by leveling up,
  // but we won't account for that here...).
  
  let targetServer;
  if (typeof target === "string") {
    targetServer = await ns.getServer(target);
  } else {
    targetServer = target;
  }
  let player = ns.getPlayer();
  let hostServer;
  if (typeof host === "string") {
    hostServer = await ns.getServer(host);
  } else {
    hostServer = host;
  }

  targetServer.moneyAvailable = targetServer.moneyMax;

  let result = [];
  let pct = formulas.calculatePercentMoneyHacked(ns, targetServer, player);
  let maxThreads = Math.ceil((1 / pct) * (targetServer.moneyAvailable / targetServer.moneyMax));

  // for every possible number of threads, compute how many grow and weaken threads will
  // be necessary to bring server back to the original state,
  let growThreads = 1;
  
  // never reset growthreads because it grows monotonically as i grows
  // this speeds up the code enormously.
  for (let i = 0; i <= maxThreads; ++i) {
    let cp = Object.assign({}, targetServer);
    let reward = hack(ns, { server: cp, threads: i, player });
    for (; growThreads < 10000; ++growThreads) {
      let cp2 = Object.assign({}, cp);
      grow(ns, { server: cp2, threads: growThreads, player, host });
      let newMoney = cp2.moneyAvailable;
      if (newMoney === targetServer.moneyAvailable) {
        cp = cp2;
        break;
      }
    }
    const coreBonus = 1 + (host.cpuCores - 1) / 16;
    let weakenThreads = Math.ceil(
      (cp.hackDifficulty - cp.minDifficulty) /
        (CONSTANTS.ServerWeakenAmount * coreBonus));
    
    result.push({
      reward,
      hackThreads: i,
      growThreads,
      weakenThreads
    });
  }
  return result;
}
