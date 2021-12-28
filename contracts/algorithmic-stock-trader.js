export function solveItBad(array, count)
{
  if (count === 0) {
    return 0;
  }
  
  let maxProfit = 0;
  for (let i = 0; i < array.length; ++i) {
    for (let j = i+1; j < array.length; ++j) {
      let profit = array[j] - array[i] + solveIt(array.slice(j+1), count - 1);
      maxProfit = Math.max(maxProfit, profit);
    }
  }
  return maxProfit;
}

export function solveIt(array, count)
{
  let memo = {};

  function inner(i, j) {
    let key = `${i}:${j}`;
    if (memo[key] !== undefined) {
      return memo[key];
    }
    if (j === 0) {
      return 0;
    }
    let maxProfit = 0;
    for (; i < array.length; ++i) {
      for (let k = i + 1; k < array.length; ++k) {
        let profit = array[k] - array[i] + inner(k + 1, j - 1);
        maxProfit = Math.max(maxProfit, profit);
      }
    }
    memo[key] = maxProfit;
    return maxProfit;
  }
  return inner(0, count);
}
