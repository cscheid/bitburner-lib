export function solveIt(array)
{
  let state = [];
  for (let i = 0; i < array.length; ++i) {
    state.push({
      index: i,
      value: array[i],
      haveTried: false,
      canTry: false
    });
  }
  state[0].canTry = true;

  while (true) {
    let thisState = state.filter(s => s.canTry && !s.haveTried);
    if (thisState.length === 0) {
      return 0;
    }
    thisState = thisState[0];
    if (thisState.index === array.length - 1) {
      return 1;
    }
    thisState.haveTried = true;
    for (let i = thisState.index; i < Math.min(thisState.index + thisState.value + 1,
                                               array.length); ++i) {
      state[i].canTry = true;
    }
  }
}
