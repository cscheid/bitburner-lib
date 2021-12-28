import arrayJumpingGame from "/contracts/array-jumping-game.js";
import findAllValidMathExpressions from "/contracts/find-all-valid-math-expressions.js";
import algorithmicStockTraderI from "/contracts/algorithmic-stock-trader-i.js";
import algorithmicStockTraderII from "/contracts/algorithmic-stock-trader-ii.js";
import uniquePathsInAGridII from "/contracts/unique-paths-in-a-grid-ii.js";
import subarrayMaximumSum from "/contracts/subarray-maximum-sum.js";
import findLargestPrimeFactor from "/contracts/find-largest-prime-factor.js";

let dispatch = {
  "Find All Valid Math Expressions": findAllValidMathExpressions,
  "Unique Paths in a Grid II": uniquePathsInAGridII,
  "Algorithmic Stock Trader I": algorithmicStockTraderI,
  "Algorithmic Stock Trader II": algorithmicStockTraderII,
  "Subarray with Maximum Sum": subarrayMaximumSum,
  "Array Jumping Game": arrayJumpingGame,
  "Find Largest Prime Factor": findLargestPrimeFactor
};

function solve(ns, filename, host)
{
  let type = ns.codingcontract.getContractType(filename, host);
  if (dispatch[type] === undefined) {
    ns.tprint(`Don't know how to solve "${type}"`);
    return undefined;
  }
  let data = ns.codingcontract.getData(filename, host);
  let result = dispatch[type](...data);
  return result;
}

/** @param {NS} ns */
export async function main(ns) {
  let filename = ns.args[0];
  let host = ns.args[1];
  ns.tprint(`Attempting to solve ${host}:${filename}`);
  let solution = solve(ns, filename, host);
  if (solution === undefined) {
    return;
  }
  ns.tprint(`Done!`);
  let result = ns.codingcontract.attempt(solution, filename, host, { returnReward: true });
  ns.tprint(`Outcome: ${result}`);
}
