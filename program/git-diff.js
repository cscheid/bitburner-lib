import { owner, repo, req, fetchConfig, downloadMany } from "/lib/gh.js";
import * as diff from 'https://cdn.skypack.dev/diff';

/** @param {NS} ns */
export async function main(ns) {
  const foo = await ns.ls("home");
  const inHome = foo.filter(name => !name.startsWith("/_git/"));
  const inGit = foo.filter(name => name.startsWith("/_git/"));

  const gitIgnore = [
    "^/log",
    "^/data",
    "^/scratch",
    "^/os",
    "^.+\.lit$",
    "^\.msg",
    "^.+\.exe$",
    "^.+\.msg",
    "^github-pat.txt$"
  ].map(x => new RegExp(x));

  for (const name of inHome) {
    if (gitIgnore.some(re => name.match(re))) {
      continue;
    }
    let inGitName;
    if (name.startsWith("/")) {
      inGitName = "/_git" + name;
    } else {
      inGitName = "/_git/" + name;
    }
    if (inGit.indexOf(inGitName) === -1) {
      await ns.tprint(`File ${name} not in repo`);
      continue;
    }

    let treeContents = ns.read(name);
    let repoContents = ns.read(inGitName);

    if (treeContents !== repoContents) {
      debugger;
      await ns.tprint(`File ${name} differs between repo and working tree`);
      const result = diff.createPatch(name, repoContents, treeContents, "repo", "tree");
      await ns.tprint(result);
    }
  }
  
  for (const name of inGit) {
    if ((Array.from(name).filter(x => x === "/").length === 2) && inHome.indexOf(name.slice(6)) === -1) {
      await ns.tprint(`File ${name} not in working tree`);
    }
    if ((Array.from(name).filter(x => x === "/").length > 2) && inHome.indexOf(name.slice(5)) === -1) {
      await ns.tprint(`File ${name} not in working tree`);
    }
  }
}
