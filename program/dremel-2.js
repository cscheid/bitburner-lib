import { grow, hack, weaken } from "/lib/rpc/api.js";
import { calculateHackingTime } from "/lib/bb/formulas.js";
import { planBootstrap, planLoop } from "/lib/bug-workaround.js";
import * as formulas from "/lib/bb/formulas.js";
import { hack as hackSim } from "/lib/bb/simulator.js";
import { ConditionVariable } from "/lib/condition-variable.js";
import { getTime, until } from "/lib/time.js";
import { fmtTime } from "/lib/fmt.js";
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

  msg(`Growing ${target.hostname}'s account`);
  let nap = 1000, micronap = 16;
  for (const step of await planBootstrap(ns, target, host, budget)) {
    await runBootstrapStep(ns, target, host, step);
  }

  msg("hack loop started");
  target = ns.getServer(target.hostname); // server now has new stats
  
  let usedBudget = budget;
  
  let timeOfLatestWeaken = performance.now(); // when is it safe to commit the next step?
  
  let step = 0;
  let totalGains = 0;
  
  let events = [];
  
  const monitorResults = async () => {
    while (true) {
      await ns.asleep(60000);
      
      let mps = totalGains / ((performance.now() - begin) / 1000);
      let mpsFmt = (~~(mps * 100)) / 100;
      await msg(`${host.hostname} -> ${target.hostname} total: ${totalGains} at ${mpsFmt}/s`);
    }
  };
  let monitorPromise = monitorResults();
  let budgetCond = new Budget(usedBudget);

  let thunks = [];

  let loopPlans = await planLoop(ns, target, host, budget);
  let loopPlan = loopPlan.maxEfficiency || loopPlan.maxReward;
  if (loopPlan === undefined) {
    throw new Error("Can't find plans!");
  }
  let stepBudget = loopPlan.weaken + loopPlan.grow + loopPlan.hack;
  msg(`Loop plan:\n\n${JSON.stringify(loopPlan)}`);

  while (true) {

    await ns.asleep(10);
    await budgetCond.request(stepBudget);

    msg(`Allocated ${stepBudget} threads`);
    
    // update target info
    let now = performance.now();
    target = ns.getServer(target.hostname);
    ++step;

    let player = ns.getPlayer();
    let actual = potentialGains(ns, target, player, loopPlan);
    let max = maxGains(ns, target, player, loopPlan);
    
    let hackDuration = formulas.calculateHackingTime(ns, target, player) * 1000;
    let hackGains = actual;
    let growDuration = hackDuration * 3.2;
    let weakenDuration = hackDuration * 4;

    // we work the scheduling times backwards from the event that's most constrained:
    // the weaken call
    let weakenStartT = Math.max(timeOfLatestWeaken + nap * 3 - weakenDuration, now);

    let weakenEndT = weakenStartT + weakenDuration;
    let growEndT = weakenEndT - nap;
    let hackEndT = growEndT - nap * 2;
    
    let growStartT = growEndT - growDuration;
    let hackStartT = hackEndT - hackDuration;
    timeOfLatestWeaken = Math.max(timeOfLatestWeaken, weakenEndT);

    if (actual / max > 0.8) {
      msg(`Scheduling loop hack to start at ${weakenStartT}`);
      if (loopPlan.weaken > 0) {
        thunks.push((async () => {
          let estDuration = weakenDuration;
          let estEnd = weakenEndT;
          await until(ns, weakenStartT);
          let {
            elapsedTime
          } = await getTime(() => weaken(ns, host.hostname, loopPlan.weaken, target.hostname));
          msg(`Weaken ${loopPlan.weaken} ${host.hostname} -> ${target.hostname}`);
          msg(`Slop in duration: ${fmtTime(elapsedTime - estDuration)}`);
          msg(`Slop in end time: ${fmtTime(weakenEndT - estEnd)}`);
          budgetCond.deposit(loopPlan.weaken);
        })());
      }
      if (loopPlan.grow > 0) {
        thunks.push((async () => {
          let estDuration = growDuration;
          let estEnd = growEndT;
          await until(ns, growStartT);
          let {
            elapsedTime
          } = await getTime(() => grow(ns, host.hostname, loopPlan.grow, target.hostname));
          msg(`Grow ${loopPlan.grow} ${host.hostname} -> ${target.hostname}`);
          msg(`Slop in duration: ${fmtTime(elapsedTime - estDuration)}`);
          msg(`Slop in end time: ${fmtTime(weakenEndT - estEnd)}`);
          budgetCond.deposit(loopPlan.grow);
        })());
      }
      if (loopPlan.hack > 0) {
        thunks.push((async () => {
          let estDuration = hackDuration;
          let estEnd = hackEndT;
          await until(ns, hackStartT);
          let {
            result,
            elapsedTime
          } = await getTime(() => hack(ns, host.hostname, loopPlan.hack, target.hostname));
          totalGains += result;
          msg(`Hack ${loopPlan.hack} ${host.hostname} -> ${target.hostname}`);
          msg(`Slop in duration: ${fmtTime(elapsedTime - estDuration)}`);
          msg(`Slop in end time: ${fmtTime(weakenEndT - estEnd)}`);
          budgetCond.deposit(loopPlan.hack);
        })());
      }
    } else {
      msg(`Scheduling boostrap to start at ${weakenStartT}`);
      // schedule a bootstrap step
      let x = (await planBootstrap(ns, target, host, stepBudget))[0];
      if (x.weaken > 0) {
        thunks.push((async () => {
          await until(ns, weakenStartT);
          await weaken(ns, host.hostname, x.weaken, target.hostname);
          msg(`Weaken ${x.weaken} ${host.hostname} -> ${target.hostname}`);
          budgetCond.deposit(stepBudget);
        })());
      }
      if (x.grow > 0) {
        thunks.push((async () => {
          await until(ns, growStartT);
          return grow(ns, host.hostname, x.grow, target.hostname);
          msg(`Grow ${x.grow} ${host.hostname} -> ${target.hostname}`);
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
