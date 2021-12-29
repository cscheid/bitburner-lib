export function choose(weights)
{
  const cumul = [weights[0]];
  for (let i = 1; i < weights.length; ++i) {
    cumul.push(weights[i] + cumul[cumul.length - 1]);
  }
  const w = cumul[cumul.length - 1];
  const r = Math.random() * w;
  for (let i = 0; i < cumul.length; ++i) {
    if (r < cumul[i])
      return i;
  }
  // should never get here (prob 0)
  return cumul.length - 1;
}
