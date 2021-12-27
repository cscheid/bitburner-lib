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
  await ns.sleep(3600 * 1000 / 5000);
  if (res.status !== 200) {
    throw new Exception(`Request ${req} failed.`);
  }
  return res.json();
}

async function getFileFromGH(ns, owner, repo, path)
{
  let res = await githubReq(ns, `repos/${owner}/${repo}/contents/${path}`);
  if (res.encoding !== "base64") {
    throw new Exception(`Don't know how to decode ${res.encoding}`);
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
	  throw new Exception('Run the script from home');
  }

  for (let filename of filesToDownload) {
	  const saveFilename = '/os/'+filename;
	  await downloadFromGH(ns, filename, saveFilename);
  }

  terminalCommand('unalias bootOS');
  terminalCommand('alias -g bootOS="run os/main.js"');

  ns.tprint("Install complete! To start, type:    bootOS");
}


function terminalCommand(message) {
  const docs = globalThis['document'];
  const terminalInput = docs.getElementById("terminal-input");
  terminalInput.value=message;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({target:terminalInput});
  terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
}

