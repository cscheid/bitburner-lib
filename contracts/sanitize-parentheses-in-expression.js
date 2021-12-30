// simple, silly branch and bound searcher
function solveIt(str)
{
  if (str.length > 20) {
    throw new Error(`cowardly refusing to solve this with a string of size ${str.length}`);
  }

  const solutions = [];
  let bestSolution = str.length + 1;
  
  function check(substr)
  {
    let count = 0;
    for (let i = 0; i < substr.length; ++i) {
      if (substr[i] === '(') {
        count += 1;
      } else if (substr[i] === ')') {
        count -= 1;
      }
      if (count < 0) {
        return;
      }
    }
    if (count === 0) {
      bestSolution = Math.min(bestSolution, str.length - substr.length);
      solutions.push(substr.join(""));
    }
  }

  const substr = [];
  function inner(ix)
  {
    if ((ix - substr.length) > bestSolution) {
      // don't recurse for solutions that can't ever be good.
      return;
    }
    
    if (ix === str.length) {
      check(substr);
      return;
    }
    
    // we either add the character at ix,
    substr.push(str[ix]);
    inner(ix + 1);
    substr.pop();

    // or we don't
    inner(ix + 1);
  }

  inner(0);

  let result = [], s = new Set();
  for (const v of solutions.filter(substr =>
    (str.length - substr.length) === bestSolution)) {
    if (s.has(v))
      continue;
    s.add(v);
    result.push(v);
  };
  return result;
}

export default solveIt;
