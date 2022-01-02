export async function until(ns, time)
{
  await ns.asleep(time - performance.now());
}
