function allSplits(str)
{
  if (str.length < 2) {
    return [[str]];
  }
  const result = [];
  
  const prev = allSplits(str.slice(1));

  // don't split
  prev.forEach(split => {
    result.push([`${str[0]}${split[0]}`, ...split.slice(1)]);
  });

  // split
  prev.forEach(split => {
    result.push([str[0], ...split]);
  });
  return result;
}

function valid(s)
{
  if (Number(s) !== 0 && s.startsWith("0"))
    return false;
  return true;
}

function allJoins(lst)
{
  if (lst.length === 1)
    return [lst[0]];

  const prev = allJoins(lst.slice(1));
  
  return [...prev.map(el => `${lst[0]}+${el}`),
          ...prev.map(el => `${lst[0]}-${el}`),
          ...prev.map(el => `${lst[0]}*${el}`)];
}

function solveIt(str, target)
{
  const result = [];
  for (const split of allSplits(str)) {
    if (split.some(v => !valid(v)))
      continue;
    for (const v of allJoins(split)) {
      // may the lord have mercy on my soul
      if (eval(v) === target) {
        result.push(v);
      }
    }
  }
  return `[${result.join(", ")}]`;
}
