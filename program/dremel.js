import * as formulas from "/lib/bb/formulas.js";
import { planBootstrap, planLoop } from "/lib/bug-workaround.js";
import { hack } from "/lib/bb/simulator.js";

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

  ns.tprint("Growing server's account");
  let nap = 100, micronap = 16;
  for (const step of await planBootstrap(ns, target, host, budget)) {
    let needNap = false;
    ns.tprint(JSON.stringify(step, null, 2));
    if (step.weaken > 0) {
      await ns.tprint(`weaken ${target.hostname} -t ${step.weaken}`);
      await ns.exec("/program/dumb-weaken.js", host.hostname, step.weaken, target.hostname);
      needNap = true;
    }
    if (step.grow > 0) {
      await ns.tprint(`grow ${target.hostname} -t ${step.grow}`);
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

  ns.tprint("hack loop started");
  target = ns.getServer(target.hostname); // server now has new stats

  let loopPlan = (await planLoop(ns, target, host, budget)).maxEfficiency;
  let stepBudget = loopPlan.weaken + loopPlan.grow + loopPlan.hack;
  
  let usedBudget = budget;
  let events = [];
  
  let timeOfLatestWeaken = performance.now(); // when is it safe to commit the next step?
  
  let step = 0;
  let totalGains = 0;
  const addMonitoringEvent = () => {
    events.push({
      when: performance.now() + 60000,
      run: async (event) => {
        let mps = totalGains / ((performance.now() - begin) / 1000);
        let mpsFmt = (~~(mps * 100)) / 100;
        await ns.tprint(`Hack ${target.hostname} total: ${totalGains} at ${mpsFmt}/s`);
        addMonitoringEvent();
      }
    });
  };
  addMonitoringEvent();

  while (true) {
    let now = performance.now();
    
    // executor step; run all scheduled events.
    events.sort((a, b) => a.when - b.when);
    for (let i = 0; i < events.length; ++i) {
      let event = events[i];
      if (event.when < now) {
        await event.run(event);
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
      
      let hackDuration = formulas.calculateHackingTime(ns, target, player) * 1000;
      let cp = Object.assign({}, target);
      hack(ns, { server: cp, player, threads: loopPlan.hack });
      let hackGains = target.moneyAvailable - cp.moneyAvailable;
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
      
      events.push({
        run: async (event) => {
          // await ns.tprint(`weaken ${event.step} scheduled`);
          await ns.exec("/program/dumb-weaken.js", host.hostname, loopPlan.weaken, target.hostname, step);
        },
        when: weakenStartT,
        step
      });
      events.push({
        run: async (event) => {
          // await ns.tprint(`Weaken ${event.step} executed`);
          usedBudget += loopPlan.weaken;
        },
        when: weakenEndT + micronap,
        step
      });
      timeOfLatestWeaken = Math.max(timeOfLatestWeaken, weakenStartT + weakenDuration + nap);

      events.push({
        run: async (event) => {
          // await ns.tprint(`Hack ${event.step} scheduled`);
          console.log("calling hack");
          
          // we steal at 90% intensity to avoid draining the account over time from (i think) race conditions
          
          let lvl = Math.ceil(loopPlan.hack * 0.9);
          
          await ns.exec("/program/dumb-hack.js", host.hostname, lvl, target.hostname, step);
        },
        when: hackStartT,
        step
      });
      events.push({
        run: async (event) => {
          totalGains += hackGains;
          // await ns.tprint(`Hack ${target.hostname} step ${event.step} (total: ${totalGains} at ${mpsFmt}/sec, ${mphFmt}/hr)`);
          usedBudget += loopPlan.hack;
        },
        when: hackEndT + micronap,
        step,
        money: hackGains
      });

      events.push({
        run: async (event) => {
          // await ns.tprint(`Grow ${event.step} scheduled`);
          console.log("calling grow");
          await ns.exec("/program/dumb-grow.js", host.hostname, loopPlan.grow, target.hostname, step);
        },
        when: growStartT,
        step
      });
      events.push({
        run: async (event) => {
          // await ns.tprint(`Grow ${event.step} executed`);
          usedBudget += loopPlan.grow;
        },
        when: growEndT + micronap,
        step
      });
    }
  }
}

/** @param {NS} ns */
export async function main(ns) {
  debugger;
  await dremel(ns, ns.getServer(ns.args[0]), ns.getServer(ns.args[1]));
}
