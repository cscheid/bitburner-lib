export async function restart(ns, path, host)
{
  await ns.kill(path, host);
  await ns.exec(path, host);
}
