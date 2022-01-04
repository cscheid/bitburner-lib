import { owner, repo, req, fetchConfig, downloadMany } from "/lib/gh.js";

/** @param {NS} ns */
export async function main(ns) {
  const filesToRemove = ns.ls("home").filter(name =>
    name.startsWith("_git") || name.startsWith("/_git"));
  for (const file of filesToRemove) {
    ns.rm(file, "home");
  };
  let { filesToDownload } = await fetchConfig(ns);
  const specs = filesToDownload.map(filename => {
    return {
      path: filename,
      saveFilename: '/_git/' + filename
    };
  });
  await downloadMany(ns, specs);
  
  const result = await req(ns, `repos/${owner}/${repo}/commits/main`);
  await ns.tprint(`fetched to commit ${result.sha}`);
}
