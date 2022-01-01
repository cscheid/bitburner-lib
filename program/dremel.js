import { planBootstrap, planLoop } from "/lib/planner.js";
import * as formulas from "/lib/bb/formulas.js";

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

  let nap = 100, micronap = 16;
  for (const step of await planBootstrap(ns, target, host, budget)) {
    let needNap = false;
    if (step.weaken > 0) {
      await ns.tprint(`weaken ${step.weaken}`);
      await ns.exec("/program/dumb-weaken.js", host.hostname, step.weaken, target.hostname);
      needNap = true;
    }
    if (step.grow > 0) {
      await ns.tprint(`grow ${step.grow}`);
      await ns.exec("/program/dumb-grow.js", host.hostname, step.grow, target.hostname);
      needNap = true;
    }
    if (step.time > 0) {
      await ns.sleep(step.time * 1000);
      needNap = true;
    }
    if (needNap) {
      await ns.sleep(nap);
    }
  }

  let loopPlan = (await planLoop(ns, target, host, budget)).maxEfficiency;
  let stepBudget = loopPlan.weaken + loopPlan.grow + loopPlan.hack;
  
  let usedBudget = budget;
  let events = [];
  
  let timeOfLatestWeaken = performance.now; // when is it safe to commit the next step?
  
  let step = 0;
  while (true) {
    let now = performance.now;
    
    // executor step; run all scheduled events.
    events.sort((a, b) => a.when - b.when);
    for (let i = 0; i < events.length; ++i) {
      let event = events[i];
      if (event.when < now) {
        await event.run();
      } else {
        events = events.slice(i);
        break;
      }
    }

    await ns.sleep(16);
    if (usedBudget >= stepBudget) {
      // schedule a step
      usedBudget -= stepBudget;
      ++step;
      // two events per action: one to schedule the action, one to recover the budget
      let player = ns.getPlayer();
      
      let hackDuration = formulas.calculateHackingTime(ns, target, player);
      let growDuration = hackDuration * 3200;
      let weakenDuration = hackDuration * 4000;

      // we work the scheduling times backwards from the event that's most constrained:
      // the weaken call
      let weakenStartT = Math.max(timeOfLatestWeaken + nap * 3 - weakenDuration, now);
      let weakenEndT = weakenStartT + weakenDuration;
      
      let growEndT = weakenEndT - nap;
      let hackEndT = growEndT - nap * 2;
      
      let growStartT = growEndT - growDuration;
      let hackStartT = hackStartT - hackDuration;
      
      events.push({
        run: async () => {
          await ns.tprint("weaken");
          await ns.exec("/program/dumb-weaken.js", host.hostname, loopPlan.weaken, target.hostname, step);
        },
        when: weakenStartT
      });
      events.push({
        run: async () => {
          usedBudget -= loopPlan.weaken;
        },
        when: weakenEndT + micronap
      });
      timeOfLatestWeaken = Math.max(timeOfLatestWeaken, weakenStartT + weakenDuration + nap);

      events.push({
        run: async () => {
          await ns.tprint("hack");
          console.log("calling hack");
          await ns.exec("/program/dumb-hack.js", host.hostname, loopPlan.hack, target.hostname, step);
        },
        when: hackStartT
      });
      events.push({
        run: async () => {
          usedBudget -= loopPlan.hack;
        },
        when: hackEndT + micronap
      });

      events.push({
        run: async () => {
          await ns.tprint("grow");
          console.log("calling grow");
          await ns.exec("/program/dumb-grow.js", host.hostname, loopPlan.grow, target.hostname, step);
        },
        when: growStartT
      });
      events.push({
        run: async () => {
          usedBudget -= loopPlan.grow;
        },
        when: growEndT + micronap
      });
    }
  }
}

/** @param {NS} ns */
export async function main(ns) {
  await dremel(ns, ns.getServer(ns.args[0]), ns.getServer(ns.args[1]));
}
