import { command } from "/lib/ui/terminal.js";

/** @param {NS} ns */
export async function main(ns) {
  let factionNodes = [{
    file: "csec-test.msg",
    node: "CSEC"
  }, {
    file: "nitesec-test.msg",
    node: "avmnite-02h"
  }, {
    file: "19dfj3l1nd.msg",
    node: "run4theh111z"
  }, {
    file: "j3.msg",
    node: "I.I.I.I"
  }];
  let hackProgs = [
// FTPCrack.exe - $1.500m - Opens up FTP Ports.
// relaySMTP.exe - $5.000m - Opens up SMTP Ports.
// HTTPWorm.exe - $30.000m - Opens up HTTP Ports.
// SQLInject.exe - $250.000m - Opens up SQL Ports.
    {
      name: "FTPCrack.exe",
      cost: 1.5e6,
    },
    {
      name: "relaySMTP.exe",
      cost: 5e6,
    },
    {
      name: "HTTPWorm.exe",
      cost: 30e6,
    },
    {
      name: "SQLInject.exe",
      cost: 250e6,
    },
  ];
  while (true) {
    for (const node of factionNodes) {
      let level = ns.getHackingLevel();
      let server = await ns.getServer(node.node);
      if (ns.fileExists(node.file, "home") &&
          ns.hasRootAccess(node.node) &&
          server.backdoorInstalled === false &&
          server.requiredHackingSkill <= level) {
        await command(ns, "home");
        await ns.asleep(1000);
        await command(ns, `go ${node.node}`);
        await ns.asleep(1000);
        await command(ns, "backdoor");
        await ns.asleep(5000);
        await command(ns, "home");
      }
    }
    let files = await ns.ls("home");
    for (const {name, cost} of hackProgs) {
      let money = ns.getPlayer().money;
      if ((cost <= money) && (files.indexOf(name) === -1)) {
        await command(ns, "home");
        await command(ns, `buy ${name}`);
      }
      await ns.asleep(1000);
    }
    await ns.asleep(10000);
  }
}
