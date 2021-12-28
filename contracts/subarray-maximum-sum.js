// this is O(n^3), a SAT would trivially make it O(n^2)
// but computers are fast, shrug
function solveIt(array)
{
  let memo = {};
  function inner(i, j) {
    let key = `${i}:${j}`;
    if (memo[key] !== undefined) {
      return memo[key];
    }
    if (i === j - 1) {
      return array[i];
    };
    let myself = array.slice(i, j).reduce((a, b) => a + b);
    let v1 = inner(i, i + 1),
        v2 = inner(j - 1, j),
        v3 = inner(i, j - 1),
        v4 = inner(i + 1, j);
    let result = Math.max(myself, v1, v2, v3, v4);
    memo[key] = result;
    return result;
  }
  return inner(0, array.length);
}

export default solveIt;
