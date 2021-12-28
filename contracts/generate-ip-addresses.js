function allSplits(str, count)
{
  if (count >= str.length) {
    return [];
  }
  if (count === 0) {
    return [[str]];
  }
  const result = [];

  const dontsplit = allSplits(str.slice(1), count);
  const split = allSplits(str.slice(1), count - 1);

  // don't split
  dontsplit.forEach(split => {
    result.push([`${str[0]}${split[0]}`, ...split.slice(1)]);
  });

  // split
  split.forEach(split => {
    result.push([str[0], ...split]);
  });
  return result;
}

function valid(s)
{
  if (Number(s) > 0 && s.startsWith("0"))
    return false;
  return Number(s) <= 255;
}

function solveIt(str)
{
  const splits = allSplits(str, 3);
  const result = [];
  for (const split of splits) {
    if (split.some(s => !valid(s)))
      continue;
    result.push(split.join("."));
  }
  return result;
}

export default solveIt;
