export const owner = "cscheid";
export const repo = "bitburner-lib";
let configFileName = 'install_files_json.txt';

/*global Headers*/
export async function req(ns, req)
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
  if (res.status !== 200) {
    throw new Error(`Request ${req} failed.`);
  }
  return res.json();
}

export async function downloadMany(ns, specs)
{
  let count = 0;
  
  let downloads = await Promise.all(specs.map(async spec => {
    let content = await getFile(ns, owner, repo, spec.path);
    ++count;
    // ns.tprint(`Installed ${count}/${specs.length}: ${spec.saveFilename}`);
    return {
      ...spec,
      content
    };
  }));
  for (const { saveFilename, content } of downloads) {
    await ns.write(saveFilename, content, "w");
  }
}

export async function getFile(ns, owner, repo, path)
{
  let res = await req(ns, `repos/${owner}/${repo}/contents/${path}`);
  if (res.encoding !== "base64") {
    throw new Error(`Don't know how to decode ${res.encoding}`);
  }
  return atob(res.content);
}

export async function download(ns, path, saveFilename)
{
  let res = await getFile(ns, owner, repo, path);
  await ns.write(saveFilename, res, "w");
}

export async function fetchConfig(ns) {
  try {
    let result = await getFile(ns, owner, repo, configFileName);
    return JSON.parse(result);
  } catch(e) {
	  ns.tprint(`ERROR: Downloading and reading config file failed ${configFileName}`);
	  throw e;
  }
}
