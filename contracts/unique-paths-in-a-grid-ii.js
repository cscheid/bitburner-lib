function solveIt(data)
{
  let memo = {};
  let h = data.length;
  let w = data[0].length;
  
  function inner(i, j) {
    let key = `${i}:${j}`;
    if (memo[key] !== undefined) {
      return memo[key];
    };
    if ((i === h - 1) && (j === w - 1)) {
      return 1 - data[i][j];
    }
    if (data[i][j] === 1) {
      memo[key] = 0;
      return 0;
    }
    let result = 0;
    if (i < h - 1) {
      result += inner(i + 1, j);
    }
    if (j < w - 1) {
      result += inner(i, j + 1);
    }
    memo[key] = result;
    return result;
  }

  return inner(0, 0);
}

export default solveIt;
