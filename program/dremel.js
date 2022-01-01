import { planBootstrap, planLoop } from "/lib/planner.js";
import formulas from "/lib/bb/formulas.js";

export async function dremel(ns, target, host)
{
  let ramCost = 1.75;

  let availableRam = target.maxRam - target.ramUsed;
  
  if (target.hostname === "home") {
    // never use full home
    availableRam = Math.min(availableRam, target.maxRam * 0.75);
  }

  let budget = ~~(availableRam / ramCost);

  let nap = 100, micronap = 16;
  for (const step of planBootstrap(ns, target, host, budget)) {
    let needNap = false;
    if (step.weaken > 0) {
      await ns.tprint("weaken");
      await ns.exec("/program/dumb-weaken.js", target.hostname, step.weaken);
      needNap = true;
    }
    if (step.grow > 0) {
      await ns.tprint("grow");
      await ns.exec("/program/dumb-grow.js", target.hostname, step.grow);
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

  let loopPlan = planLoop(ns, target, host, budget).maxEfficiency;
  let stepBudget = loopPlan.weaken + loopPlan.grow + loopPlan.hack;
  
  let usedBudget = budget;
  let events = [];
  
  let timeOfLatestWeaken = performance.now; // when is it safe to commit the next step?
  
  while (true) {
    let now = performance.now;
    
    // executor step; run all scheduled events.
    for (let i = 0; i < events.length; ++i) {
      let event = events[i];
      if (event.when < now) {
        await event.run();
      } else {
        events = events.slice(i);
        break;
      }
    }

    let step = 0;
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
          await ns.exec("/program/dumb-weaken.js", host.hostname, loopPlan.weaken, step);
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
          await ns.exec("/program/dumb-hack.js", host.hostname, loopPlan.hack, step);
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
          await ns.exec("/program/dumb-grow.js", host.hostname, loopPlan.grow, step);
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
