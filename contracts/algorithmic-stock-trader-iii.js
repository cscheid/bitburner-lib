// dumb way to do it, but apparently enough
export function solveIt(array, count)
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
