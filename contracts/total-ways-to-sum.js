function solveIt(n)
{
  let memo = {};
  
  function inner(term, target) {
    let key = `${term}:${target}`;
    if (memo[key] !== undefined) {
      return memo[key];
    }
    if (term === target) {
      return 1;
    }
    if (target <= 0) {
      return 0;
    }
    if (term > target) {
      return 0;
    }
    
    // I either choose to include "term + "... or I don't

    // if I do, then the new target is target - term, but I can reuse term
    let yes = inner(term, target - term);

    // if I don't, then I can't ever use term anymore, but it's still the same target
    let no = inner(term + 1, target);

    let result = yes + no;

    memo[key] = result;
    return result;
  }

  return inner(1, n) - 1;
}

export default solveIt;
