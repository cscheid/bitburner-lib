import { grow, hack, weaken } from "/lib/rpc/api.js";
import { calculateHackingTime } from "/lib/bb/formulas.js";
import { planBootstrap, planLoop } from "/lib/bug-workaround.js";
import * as formulas from "/lib/bb/formulas.js";
import { hack as hackSim } from "/lib/bb/simulator.js";
import { ConditionVariable } from "/lib/condition-variable.js";
import { getTime, until } from "/lib/time.js";
import { fmtTime, fmtNow } from "/lib/fmt.js";
import { msg } from "/lib/ui/debug.js";

class Budget
{
  constructor(totalBudget)
  {
    this.budget = totalBudget;
    this.cond = new ConditionVariable();
  }

  async request(amount)
  {
    await this.cond.wait(() => this.budget >= amount);
    this.budget -= amount;
  }

  deposit(amount) {
    this.budget += amount;
    this.cond.notifyAll();
  }
};

function potentialGains(ns, target, player, loopPlan)
{
  let cp = Object.assign({}, target);
  hackSim(ns, { server: cp, player, threads: loopPlan.hack });
  return target.moneyAvailable - cp.moneyAvailable;
}

function maxGains(ns, target, player, loopPlan)
{
  let cp = Object.assign({}, target);
  cp.moneyAvailable = target.moneyMax;
  hackSim(ns, { server: cp, player, threads: loopPlan.hack });
  return target.moneyMax - cp.moneyAvailable;
}

export function runBootstrapStep(ns, target, host, step)
{
  let promises = [];
  if (step.weaken > 0) {
    promises.push(weaken(ns, host.hostname, step.weaken, target.hostname));
  }
  if (step.grow > 0) {
    promises.push(grow(ns, host.hostname, step.grow, target.hostname));
  }
  return Promise.all(promises);
}

export async function dremel(ns, target, host)
{
  debugger;
  let ramCost = 1.75;

  let availableRam = host.maxRam - host.ramUsed;
  
  if (host.hostname === "home") {
    // never use full home
    availableRam = Math.min(availableRam, host.maxRam * 0.75);
  }

  let budget = ~~(availableRam / ramCost);
  let begin = performance.now();

  msg(ns, `${fmtNow()}: Dremel ${host.hostname} -> ${target.hostname} start`);
  msg(ns, `Growing ${target.hostname}'s account`);
  let nap = 1000, micronap = 16;
  for (const step of await planBootstrap(ns, target, host, budget)) {
    await runBootstrapStep(ns, target, host, step);
  }

  msg(ns, "hack loop started", -2);
  target = ns.getServer(target.hostname); // server now has new stats
  
  let usedBudget = budget;
  
  let timeOfLatestWeaken = performance.now(); // when is it safe to commit the next step?
  
  let step = 0;
  let totalGains = 0;
  let expectedTotalGains = 0;
  
  let events = [];
  
  const monitorResults = async () => {
    while (true) {
      await ns.asleep(60000);
      
      let mps = totalGains / ((performance.now() - begin) / 1000);
      let mpsFmt = (~~(mps * 100)) / 100;
      ns.tprint(`${host.hostname} -> ${target.hostname} total: ${totalGains} at ${mpsFmt}/s`);
    }
  };
  let monitorPromise = monitorResults();
  let budgetCond = new Budget(usedBudget);

  let thunks = [];

  let loopPlans = await planLoop(ns, target, host, budget);
  let loopPlan = loopPlans.maxEfficiency || loopPlans.maxReward;
  let player = ns.getPlayer();
  let expected = potentialGains(ns, target, player, loopPlan);
  if (loopPlan === undefined) {
    throw new Error("Can't find plans!");
  }
  if (loopPlans.efficiency) {
    msg(ns, `Using efficient plans`, -2);
  } else {
    msg(ns, `Using max-reward plans`, -2);
  }
  let stepBudget = loopPlan.weaken + loopPlan.grow + loopPlan.hack;
  msg(ns, `Loop plan:\n\n${JSON.stringify(loopPlan)}`, -2);

  while (true) {

    await ns.asleep(10);
    await budgetCond.request(stepBudget);

    msg(ns, `Allocated ${stepBudget} threads`, -3);
    
    // update target info
    let now = performance.now();
    ++step;

    let max = maxGains(ns, target, player, loopPlan);
    
    let hackDuration = formulas.calculateHackingTime(ns, target, player) * 1000;
    let growDuration = hackDuration * 3.2;
    let weakenDuration = hackDuration * 4;

    // we work the scheduling times backwards from the event that's most constrained:
    // the weaken call
    let weakenStartT = Math.max(timeOfLatestWeaken + nap * 3 - weakenDuration, now);

    let weakenEndT = weakenStartT + weakenDuration;
    let growEndT   = weakenEndT - nap;
    let hackEndT   = weakenEndT - nap * 2;
    
    let growStartT = growEndT - growDuration;
    let hackStartT = hackEndT - hackDuration;
    timeOfLatestWeaken = Math.max(timeOfLatestWeaken, weakenEndT);

    if (expectedTotalGains === 0 || (totalGains / expectedTotalGains)) {
      msg(ns, `(${fmtNow()}) Scheduling loop hack to start, step ${step}`, -1);
      msg(ns, `  weaken: ${fmtTime(weakenStartT/1000)}-${fmtTime(weakenEndT/1000)} duration: ${fmtTime(weakenDuration/1000)}`, -2);
      msg(ns, `  grow: ${fmtTime(growStartT/1000)}-${fmtTime(growEndT/1000)} duration: ${fmtTime(growDuration/1000)}`, -2);
      msg(ns, `  hack: ${fmtTime(hackStartT/1000)}-${fmtTime(hackEndT/1000)} duration: ${fmtTime(hackDuration/1000)}`, -2);
      if (loopPlan.weaken > 0) {
        thunks.push((async () => {
          let estDuration = weakenDuration;
          let estEnd = weakenEndT;
          let whichStep = step;
          msg(ns, `[weaken step ${step} nap at ${fmtNow()} until ${fmtTime(weakenStartT/1000)}]`, -2);
          await until(ns, weakenStartT);
          let {
            elapsedTime
          } = await getTime(() => weaken(ns, host.hostname, loopPlan.weaken, target.hostname));
          player = ns.getPlayer();
          msg(ns, `(${fmtNow()}) Weaken ${loopPlan.weaken} ${host.hostname} -> ${target.hostname} step ${whichStep}`, -1);
          msg(ns, `  Slop in duration: ${fmtTime((elapsedTime - estDuration)/1000)}`, -2);
          msg(ns, `  Slop in end time: ${fmtTime((performance.now() - estEnd)/1000)}`, -2);
          budgetCond.deposit(loopPlan.weaken);
        })());
      }
      if (loopPlan.grow > 0) {
        thunks.push((async () => {
          let estDuration = growDuration;
          let estEnd = growEndT;
          let whichStep = step;
          msg(ns, `[grow step ${step} nap at ${fmtNow()} until ${fmtTime(growStartT/1000)}]`, -2);
          await until(ns, growStartT);
          let {
            elapsedTime
          } = await getTime(() => grow(ns, host.hostname, loopPlan.grow, target.hostname));
          player = ns.getPlayer();
          msg(ns, `(${fmtNow()}) Grow ${loopPlan.grow} ${host.hostname} -> ${target.hostname} step ${whichStep}`, -1);
          msg(ns, `  Slop in duration: ${fmtTime((elapsedTime - estDuration)/1000)}`, -2);
          msg(ns, `  Slop in end time: ${fmtTime((performance.now() - estEnd)/1000)}`, -2);
          budgetCond.deposit(loopPlan.grow);
        })());
      }
      if (loopPlan.hack > 0) {
        thunks.push((async () => {
          let estDuration = hackDuration;
          let estEnd = hackEndT;
          let whichStep = step;
          msg(ns, `[hack step ${step} nap at ${fmtNow()} until ${fmtTime(hackStartT/1000)}]`, -2);
          await until(ns, hackStartT);
          let {
            result,
            elapsedTime
          } = await getTime(() => hack(ns, host.hostname, loopPlan.hack, target.hostname));
          player = ns.getPlayer();
          totalGains += result;
          msg(ns, `(${fmtNow()}) Hack ${loopPlan.hack} ${host.hostname} -> ${target.hostname} step ${whichStep}`, -1);
          msg(ns, `  Slop in duration: ${fmtTime((elapsedTime - estDuration)/1000)}`, -2);
          msg(ns, `  Slop in end time: ${fmtTime((performance.now() - estEnd)/1000)}`, -2);
          if (result > 0) {
            msg(ns, `  Slop in reward: ${result - expected}`, -2);
            expectedTotalGains += expected;
          } else {
            msg(ns, `  Hacking failed :(`, -2);
          };
          budgetCond.deposit(loopPlan.hack);
        })());
      }
    } else {
      msg(ns, `Scheduling boostrap to start at ${fmtTime(weakenStartT/1000)}`, -2);
      // schedule a bootstrap step
      let x = (await planBootstrap(ns, target, host, stepBudget))[0];
      if (x.weaken > 0) {
        thunks.push((async () => {
          await until(ns, weakenStartT);
          await weaken(ns, host.hostname, x.weaken, target.hostname);
          msg(ns, `(${fmtNow()}) bootstrap Weaken ${x.weaken} ${host.hostname} -> ${target.hostname}`, -2);
          budgetCond.deposit(stepBudget);
        })());
      }
      if (x.grow > 0) {
        thunks.push((async () => {
          await until(ns, growStartT);
          return grow(ns, host.hostname, x.grow, target.hostname);
          msg(ns, `(${fmtNow()}) bootstrap Grow ${x.grow} ${host.hostname} -> ${target.hostname}`, -2);
        })());
      }
    }
  }
}


/** @param {NS} ns */
export async function main(ns)
{
  let someArgs = ["foo", "bar"]; // args to pass to remote program
  let target = ns.args[0];
  let host = ns.args[1];

  await dremel(ns, ns.getServer(target), ns.getServer(host));
}
