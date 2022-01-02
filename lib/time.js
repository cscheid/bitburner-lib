export async function getTime(thunk)
{
  const before = performance.now();
  const result = await thunk();
  return {
    result,
    elapsedTime: performance.now() - before
  };
}

export async function until(ns, time)
{
  await ns.asleep(Math.max(0, time - performance.now()));
}
