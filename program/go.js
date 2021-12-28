import { visit, scanAnalyze } from "/lib/net.js";
import { command } from "/lib/ui/terminal.js";

/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  let targetPath;
  await visit(ns, (host, path) => {
    if (host.name === target) {
      targetPath = path.slice();
    }
  });
	let net = await scanAnalyze(ns, "home", 100);
  ns.tprint(targetPath.join(" -> "));
  command("home");
  for (const host of targetPath.slice(1)) {
    command(`connect ${host}`);
  }
}
