/** @param {NS} ns */
import { visit } from "/lib/net.js";

export async function main(ns) {
  const homeFiles = new Set();
  for (const file of ns.ls("home")) {
    homeFiles.add(file);
  }
  const result = [];
  await visit(ns, (host) => {
    if (host.name === "home")
      return;
    
    const files = ns
          .ls(host.name)
          .filter(file => !homeFiles.has(file));

    result.push({ host: host.name,
                  files: files });
  });
}
