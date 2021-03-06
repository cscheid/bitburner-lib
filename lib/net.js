export async function allNodes(ns) {
  let result = [];
  await visit(ns, (node) => {
    result.push(node);
  });
  return result;
}

export async function getNode(ns, name) {
  let result;
  await visit(ns, (node) => {
    if (node.name === name) {
      result = node;
    }
  });
  return result;
}

export async function visit(ns, callable) {
	let net = await scanAnalyze(ns);
  let path = [];
	async function inner(host) {
    path.push(host.name);
		await callable(host, path);
		for (let i = 0; i < host.children.length; ++i) {
			await inner(host.children[i]);
		}
    path.pop();
	}
	await inner(net);
}

export async function scanAnalyze(ns, host, depth, visitedHosts) {
  if (host === undefined) {
    host = "home";
  }
  if (depth === undefined) {
    depth = 100;
  }
  if (visitedHosts === undefined) {
    visitedHosts = {};
    visitedHosts[host] = true;
  }
	depth = ~~depth;
  
	let analysis = await analyze(ns, host);
	let hosts = await ns.scan(host);
	let children = [];
	analysis.children = children;
	if (depth <= 0)
		return analysis;
	for (let i = 0; i < hosts.length; ++i) {
		let target = hosts[i];
		if (visitedHosts[target]) {
			continue;
		}
		visitedHosts[target] = true; 
		children.push(await scanAnalyze(ns, target, depth - 1, visitedHosts));
	}
	return analysis;
}

export async function analyze(ns, host) {
	let hasRootAccess = await ns.hasRootAccess(host);
	let requiredHackingLevel = await ns.getServerRequiredHackingLevel(host);
	let numPortsRequired = await ns.getServerNumPortsRequired(host);
	let maxRam = await ns.getServerMaxRam(host);
  let maxMoney = await ns.getServerMaxMoney(host);
  let minSecurity = await ns.getServerMinSecurityLevel(host);
  let money = await ns.getServerMoneyAvailable(host);
  let security = await ns.getServerSecurityLevel(host);
  
	return {
		name: host,
		hasRootAccess,
		requiredHackingLevel,
		numPortsRequired,
		maxRam,
    maxMoney,
    minSecurity,
    money,
    security
	};
}

export function getPortOpenCapabilities(ns)
{
  const result = ns.ls("home");
  return {
    brutessh: result.indexOf("BruteSSH.exe") !== -1,
    ftpcrack: result.indexOf("FTPCrack.exe") !== -1,
    relaysmtp: result.indexOf("relaySMTP.exe") !== -1,
    httpworm: result.indexOf("HTTPWorm.exe") !== -1,
    sqlinject: result.indexOf("SQLInject.exe") !== -1
  };
}

export function openAllPorts(ns, host)
{
  for (const [cmd, val] of Object.entries(getPortOpenCapabilities(ns)))
  {
    if (!val)
      continue;
    ns[cmd](host);
  }
}

export function totalPorts(ns)
{
  return Object.entries(getPortOpenCapabilities(ns))
      .filter(([cmd, val]) => val)
      .length;
}
