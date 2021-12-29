// lots of inspiration from https://github.com/lethern/Bitburner_os/blob/main/install.js

let owner = "cscheid";
let repo = "bitburner-lib";
let configFileName = 'install_files_json.txt';

async function githubReq(ns, req)
{
  let { user, pat } = JSON.parse(await ns.read("github-pat.txt"));
  let url = `https://api.github.com/${req}`;
  let authString = btoa(`${user}:${pat}`);
  let headers = new Headers();
  headers.set('Authorization', `basic ${authString}`);
  ns.print(`Requesting ${url}`);
  let res = await fetch(url, { method: 'GET', headers });
  // an authenticated github account can make 5000 requests/hour
  // but we're going to throttle it at 50k/hour and hope people don't hammer it..
  // 
  await ns.sleep(3600 * 100 / 5000);
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
	  throw new Error('Run the script from home');
  }
  ns.tprint("Will download files.");
  ns.print(JSON.stringify(filesToDownload, null, 2));

  let count = 0;
  for (let filename of filesToDownload) {
    try {
	    await downloadFromGH(ns, filename, '/' + filename);
      ++count;
      ns.tprint(`Installed ${count}/${filesToDownload.length}: ${filename}`);
    } catch (e) {
      ns.tprint(String(e));
      ++count;
    }
  }
  
  ns.tprint("Install complete!");
  await ns.run("setup.js", 1);
}


