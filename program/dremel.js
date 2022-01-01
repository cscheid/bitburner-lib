import * as formulas from "/lib/bb/formulas.js";
import { planBootstrap, planLoop } from "/lib/bug-workaround.js";
import { hack } from "/lib/bb/simulator.js";

function potentialGains(ns, target, player, loopPlan)
{
  let cp = Object.assign({}, target);
  hack(ns, { server: cp, player, threads: loopPlan.hack });
  return target.moneyAvailable - cp.moneyAvailable;
}

function maxGains(ns, target, player, loopPlan)
{
  let cp = Object.assign({}, target);
  cp.moneyAvailable = target.moneyMax;
  hack(ns, { server: cp, player, threads: loopPlan.hack });
  return target.moneyMax - cp.moneyAvailable;
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
        await ns.tprint(`${host.hostname} -> ${target.hostname} total: ${totalGains} at ${mpsFmt}/s`);
        addMonitoringEvent();
      }
    });
  };
  addMonitoringEvent();

  while (true) {
    let now = performance.now();
    // update target info
    target = ns.getServer(target.hostname);
    await ns.sleep(16);
    
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

    if (usedBudget < stepBudget) {
      continue;
    }

    // we'll schedule an action step.
    usedBudget -= stepBudget;

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

    ++step;
    
    // two events per action: one to schedule the action, one to recover the budget
    const scheduleHack = (amt) => {
      events.push({
        run: async (event) => {
          // await ns.tprint(`Hack ${event.step} scheduled`);
          console.log("calling hack");
          
          await ns.exec("/program/dumb-hack.js", host.hostname, event.amt, target.hostname, event.step);
        },
        when: hackStartT,
        step,
        amt
      }, {
        run: async (event) => {
          totalGains += event.money;
          usedBudget += event.amt;
        },
        when: hackEndT + micronap,
        step,
        money: hackGains,
        amt
      });
    };
    const scheduleWeaken = (amt) => {
      events.push({
        run: async (event) => {
          // await ns.tprint(`weaken ${event.step} scheduled`);
          await ns.exec("/program/dumb-weaken.js", host.hostname, event.amt, target.hostname, event.step);
        },
        when: weakenStartT,
        step,
        amt
      }, {
        run: async (event) => {
          // await ns.tprint(`Weaken ${event.step} executed`);
          usedBudget += event.amt;
        },
        when: weakenEndT + micronap,
        step,
        amt
      });
      timeOfLatestWeaken = Math.max(timeOfLatestWeaken, weakenStartT + weakenDuration + nap);
    };
    const scheduleGrow = (amt) => {
      events.push({
        run: async (event) => {
          // await ns.tprint(`Grow ${event.step} scheduled`);
          console.log("calling grow");
          await ns.exec("/program/dumb-grow.js", host.hostname, event.amt, target.hostname, event.step);
        },
        when: growStartT,
        step,
        amt
      }, {
        run: async (event) => {
          // await ns.tprint(`Grow ${event.step} executed`);
          usedBudget += event.amt;
        },
        when: growEndT + micronap,
        step,
        amt
      });
    };
    
    if (actual / max < 0.5) {
      // schedule a bootstrap step
      let x = (await planBootstrap(ns, target, host, stepBudget))[0];
      if (x.weaken > 0) {
        scheduleWeaken(x.weaken);
      }
      if (x.grow > 0) {
        scheduleGrow(x.grow);
      }
    } else {
      // schedule a hack step
      
      scheduleWeaken(loopPlan.weaken);
      scheduleHack(loopPlan.hack);
      scheduleGrow(loopPlan.grow);
    }
  }
}

/** @param {NS} ns */
export async function main(ns) {
  debugger;
  await dremel(ns, ns.getServer(ns.args[0]), ns.getServer(ns.args[1]));
}
