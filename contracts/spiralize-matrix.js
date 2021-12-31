function rotate(matrix)
{
  let result = [];
  let h = matrix.length;
  if (h === 0) {
    return [];
  }
  let w = matrix[0].length;
  for (let i = w - 1; i >= 0; --i) {
    let line = [];
    for (let j = 0; j < h; ++j) {
      line.push(matrix[j][i]);
    }
    result.push(line);
  }
  return result;
}

function solveIt(data)
{
  if (data.length === 0) {
    return [];
  }
  return [...data[0], ...solveIt(rotate(data.slice(1)))];
}
