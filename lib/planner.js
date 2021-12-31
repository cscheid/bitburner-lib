import * as formulas from "/lib/bb/formulas.js";

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

  return {
    growth: formulas.calculateServerGrowth(ns, targetServer, 1, player, host.cpuCores),
    chance: formulas.calculateHackingChance(ns, targetServer, player),
    money: formulas.calculatePercentMoneyHacked(ns, targetServer, player),
    time: formulas.calculateHackingTime(ns, targetServer, player)
  };
}
