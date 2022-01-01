import { planBootstrap as bs, planLoop as loop } from "/lib/planner.js";

export async function planBootstrap(...args)
{
  return bs(...args);
}

export async function planLoop(...args)
{
  return loop(...args);
}
