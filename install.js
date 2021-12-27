// from https://github.com/lethern/Bitburner_os/blob/main/install.js
let baseUrl = 'https://raw.githubusercontent.com/cscheid/bitburner-lib/main/';
let json_filename = 'install_files_json.txt';

async function downloadFromGH(ns, path, save_filename)
{
	try {
	  await ns.scriptKill(save_filename, 'home');
	  await ns.rm(save_filename);
	  await ns.sleep(20);
	  await ns.wget(path + '?ts=' + new Date().getTime(), save_filename);
	} catch (e) {
	  ns.tprint(`ERROR (tried to download ${path})`);
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
	  const path = baseUrl + filename;
	  const save_filename = '/os/'+filename;
	  await downloadFromGH(ns, path, save_filename);
  }

  // terminalCommand('unalias bootOS');
  // terminalCommand('alias -g bootOS="run os/main.js"');

  ns.tprint("Install complete! To start, type:    bootOS");
}

async function fetchConfig(ns) {
  try {
	  await ns.rm(json_filename);
	  await ns.wget(baseUrl + json_filename + '?ts=' + new Date().getTime(), json_filename);
	  return JSON.parse(ns.read(json_filename));
  } catch(e) {
	  ns.tprint(`ERROR: Downloading and reading config file failed ${json_filename}`);
	  throw e;
  }
}

function terminalCommand(message) {
  const docs = globalThis['document'];
  const terminalInput = docs.getElementById("terminal-input");
  terminalInput.value=message;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({target:terminalInput});
  terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
}
