export async function getTime(thunk)
{
  const before = performance.now();
  const result = await thunk();
  return {
    result,
    elapsedTime: performance.now() - before
  };
}
