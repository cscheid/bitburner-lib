export async function until(ns, time)
{
  await ns.asleep(Math.max(0, time - performance.now()));
}
