function uniquePaths(i, j, memo)
{
  memo = memo || {};
  const key = `${i}:${j}`;
  if (memo[key]) {
    return memo[key];
  }
  if (i === 1 || j === 1) {
    return 1;
  }
  const result = uniquePaths(i - 1, j, memo) + uniquePaths(i, j - 1, memo);
  memo[key] = result;
  return result;
}

function solveIt([i, j])
{
  return uniquePaths(i, j);
}

export default solveIt;
