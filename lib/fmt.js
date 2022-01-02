export function formatTable(lst)
{
  const maxs = lst[0].map(el => 0);
  lst.forEach(row => {
    row.forEach((v, i) => {
      maxs[i] = Math.max(maxs[i], v.length);
    });
  });

  const result = [];
  lst.forEach(row => {
    const strs = [];
    row.forEach((v, i) => {
      const pad = " ".repeat(maxs[i] - v.length);
      strs.push(v + pad);
    });
    result.push(strs.join(" | "));
    if (result.length === 1) {
      result.push("-".repeat(result[0].length));
    }
  });
  
  return result.join("\n");
}

export function fmtTime(v)
{
  return String(Math.round(Math.round(v * 100) / 100));
}

export function fmtNow()
{
  return fmtTime(performance.now() / 1000);
}
