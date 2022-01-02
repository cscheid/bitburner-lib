// lots of inspiration from https://github.com/lethern/Bitburner_os/blob/main/install.js
import { command } from "/lib/ui/terminal.js";

let owner = "cscheid";
let repo = "bitburner-lib";
let configFileName = 'install_files_json.txt';

// NB an authenticated github account can make 5000 requests/hour
async function githubReq(ns, req)
{
  let { user, pat } = JSON.parse(await ns.read("github-pat.txt"));
  let url = `https://api.github.com/${req}`;
  let authString = btoa(`${user}:${pat}`);
  let headers = new Headers();
  headers.set('Authorization', `basic ${authString}`);
  ns.print(`Requesting ${url}`);
  let res = await fetch(url, { method: 'GET', headers });
  if (res.status !== 200) {
    throw new Error(`Request ${req} failed.`);
  }
  return res.json();
}

async function getFileFromGH(ns, owner, repo, path)
{
  let res = await githubReq(ns, `repos/${owner}/${repo}/contents/${path}`);
  if (res.encoding !== "base64") {
    throw new Error(`Don't know how to decode ${res.encoding}`);
  }
  return atob(res.content);
}

async function downloadFromGH(ns, path, saveFilename)
{
  let res = await getFileFromGH(ns, owner, repo, path);
  await ns.write(saveFilename, res, "w");
}

async function downloadManyFromGH(ns, specs)
{
  let count = 0;
  
  let downloads = await Promise.all(specs.map(async spec => {
    let content = await getFileFromGH(ns, owner, repo, spec.path);
    ++count;
    ns.tprint(`Installed ${count}/${specs.length}: ${spec.saveFilename}`);
    return {
      ...spec,
      content
    };
  }));
  for (const { saveFilename, content } of downloads) {
    await ns.write(saveFilename, content, "w");
  }
}

async function fetchConfig(ns) {
  try {
    let result = await getFileFromGH(ns, owner, repo, configFileName);
    return JSON.parse(result);
  } catch(e) {
	  ns.tprint(`ERROR: Downloading and reading config file failed ${configFileName}`);
	  throw e;
  }
}

/** @param {NS} ns */
export async function main(ns) {
  let { welcomeLabel, filesToDownload } = await fetchConfig(ns);
  
  ns.tprint(welcomeLabel);

  let hostname = ns.getHostname();

  if (hostname !== 'home') {
    command("home");
  }
  ns.tprint("Will download files.");
  ns.print(JSON.stringify(filesToDownload, null, 2));

  const specs = filesToDownload.map(filename => {
    return {
      path: filename,
      saveFilename: '/' + filename
    };
  });
  await downloadManyFromGH(ns, specs);
 
  for (const file of await ns.ls("home", "/program/")) {
    if (!file.startsWith("/program/")) {
      continue;
    }
    let shortcut = file.slice("/program/".length, -(".js".length));
    ns.tprint("Setting up alias for ${shortcut}");
    await command(`unalias ${shortcut}`);
    await command(`alias ${shortcut}="run ${file}"`);
  }
  
  ns.tprint("Install complete!");
  if (ns.args[0] !== "-n") { // no setup or reset
    await ns.run("setup.js", 1);
  }
}


