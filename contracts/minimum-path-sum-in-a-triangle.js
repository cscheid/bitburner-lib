function solveIt(data)
{
  let memo = {};
  let h = data.length;
  function inner(i, j)
  {
    let key = `${i}:${j}`;
    if (memo[key] !== undefined) {
      return memo[key];
    }
    if (i === h - 1) {
      return data[i][j];
    }
    let cost = data[i][j] + Math.min(inner(i+1, j), inner(i+1, j+1));
    memo[key] = cost;
    return cost;
  }
  return inner(0, 0);
}

export default solveIt;
