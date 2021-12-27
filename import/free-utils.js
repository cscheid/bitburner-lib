// we don't call the API here and don't incur any RAM cost, hence "free"

Array.prototype.minBy = function(fn) { 
  return this.extremumBy(fn, Math.min); 
};

Array.prototype.maxBy = function(fn) { 
  return this.extremumBy(fn, Math.max);
};

Array.prototype.extremumBy = function(pluck, extremum) {
  return this.reduce(function(best, next) {
    var pair = [ pluck(next), next ];
    if (!best) {
       return pair;
    } else if (extremum.apply(null, [ best[0], pair[0] ]) == best[0]) {
       return best;
    } else {
       return pair;
    }
  },null)[1];
};

export function formatLs(fileList)
{
  return "\n\n" + fileList.join("\n");
}

let foo;
export default foo;
