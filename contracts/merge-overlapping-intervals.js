function solveIt(array)
{
  let bumps = {};
  array.forEach(([s, e]) => {
    bumps[s] = (~~bumps[s]) + 1;
    bumps[e] = (~~bumps[e]) - 1;
  });
  let sortedBumps = Object.entries(bumps).sort((a, b) => a[0] - b[0]);
  let merged = [];
  let start;
  let value = 0;
  for (const [b, delta] of sortedBumps) {
    if (value === 0) {
      start = b;
    }
    value += delta;
    if (value === 0) {
      merged.push([start, b]);
    }
  }
  return merged;
}

export default solveIt;
