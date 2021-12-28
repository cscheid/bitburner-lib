export async function logNow(ns)
{
  await ns.print((new Date()).toLocaleTimeString());
}
