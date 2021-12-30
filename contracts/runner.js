import arrayJumpingGame from "/contracts/array-jumping-game.js";
import findAllValidMathExpressions from "/contracts/find-all-valid-math-expressions.js";
import algorithmicStockTraderI from "/contracts/algorithmic-stock-trader-i.js";
import algorithmicStockTraderII from "/contracts/algorithmic-stock-trader-ii.js";
import algorithmicStockTraderIII from "/contracts/algorithmic-stock-trader-iii.js";
import algorithmicStockTraderIV from "/contracts/algorithmic-stock-trader-iv.js";
import uniquePathsInAGridII from "/contracts/unique-paths-in-a-grid-ii.js";
import subarrayMaximumSum from "/contracts/subarray-maximum-sum.js";
import findLargestPrimeFactor from "/contracts/find-largest-prime-factor.js";
import mergeOverlappingIntervals from "/contracts/merge-overlapping-intervals.js";
import uniquePathsInAGrid from "/contracts/unique-paths.js";
import generateIpAddresses from "/contracts/generate-ip-addresses.js";
import totalWaysToSum from "/contracts/total-ways-to-sum.js";
import minimumPathSumInATriangle from "/contracts/minimum-path-sum-in-a-triangle.js";
import sanitizeParenthesesInExpression from "/contracts/sanitize-parentheses-in-expression.js";

let dispatch = {
  "Find All Valid Math Expressions": findAllValidMathExpressions,
  "Unique Paths in a Grid II": uniquePathsInAGridII,
  "Unique Paths in a Grid I": uniquePathsInAGrid,
  "Algorithmic Stock Trader I": algorithmicStockTraderI,
  "Algorithmic Stock Trader II": algorithmicStockTraderII,
  "Algorithmic Stock Trader III": algorithmicStockTraderIII,
  "Algorithmic Stock Trader IV": algorithmicStockTraderIV,
  "Subarray with Maximum Sum": subarrayMaximumSum,
  "Array Jumping Game": arrayJumpingGame,
  "Find Largest Prime Factor": findLargestPrimeFactor,
  "Merge Overlapping Intervals": mergeOverlappingIntervals,
  "Generate IP Addresses": generateIpAddresses,
  "Total Ways to Sum": totalWaysToSum,
  "Minimum Path Sum in a Triangle": minimumPathSumInATriangle,
  "Sanitize Parentheses in Expression": sanitizeParenthesesInExpression
};

export function solve(ns, filename, host)
{
  let type = ns.codingcontract.getContractType(filename, host);
  if (dispatch[type] === undefined) {
    ns.tprint(`Don't know how to solve "${type}"`);
    return undefined;
  }
  let data = ns.codingcontract.getData(filename, host);
  ns.tprint("Will solve with data:");
  ns.tprint(JSON.stringify(data));
  let result = dispatch[type](data);
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
