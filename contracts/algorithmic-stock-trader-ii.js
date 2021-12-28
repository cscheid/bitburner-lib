import { solveIt as ast } from "/contracts/algorithmic-stock-trader.js";

function solveIt(array)
{
  let memo = {};
  function inner(i)
  {
    let key = `${i}`;
    if (memo[key] !== undefined) {
      return memo[key];
    }
    if (i >= array.length - 1) {
      return 0;
    }
    // we either buy at i or don't

    let best = 0;
    // if we buy at i, then the best result is selling at some later point
    // + whatever is the best _after_.
    //
    // if we don't buy at i, that's the same as buying at i and _selling_ at i,
    // so we simply initialize the loop at j = i instead of j = i + 1 to get that
    // option.
    
    for (let j = i; j < array.length; ++j) {
      let thisProfit = Math.max(0, array[j] - array[i]);
      let nextProfit = inner(j + 1);
      best = Math.max(best, thisProfit + nextProfit);
    }

    memo[key] = best;
    return best;
  };
  return inner(0);
}
