import arrayJumpingGame from "/contracts/array-jumping-game.js";
import findAllValidMathExpressions from "/contracts/find-all-valid-math-expressions.js";

let dispatch = {
  "Find All Valid Math Expressions": findAllValidMathExpressions,
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
  ns.tprint(solve(ns, filename, host));
}
