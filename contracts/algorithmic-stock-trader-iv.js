import { solveIt as ast } from "/contracts/algorithmic-stock-trader.js";

function solveIt([count, array])
{
  return ast(array, count);
}

export default solveIt;
