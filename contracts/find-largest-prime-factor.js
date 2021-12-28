// let's just sieve this BS
function solveIt(num)
{
  let maxSize = ~~Math.sqrt(num);
  let array = new Uint8Array(maxSize + 1);
  let primes = [];
  for (let i = 2; i < array.length; ++i) {
    if (array[i] === 0) {
      primes.push(i);
      array[i] = 1;
      for (let j = i; j < array.length; j += i) {
        array[j] = 1;
      }
    }
  }
  let maxDivided = 1;
  
  for (const p of primes) {
    while (num % p === 0) {
      num /= p;
      maxDivided = p;
    }
  }
  return Math.max(maxDivided, num);
}
