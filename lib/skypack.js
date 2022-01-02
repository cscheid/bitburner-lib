export async function require(specifier)
{
  let result = await import(`https://cdn.skypack.dev/${specifier}`);
  return result;
}
