import { execAndThen } from "/lib/rpc.js";

async function test(ns)
{
  let someArgs = ["foo", "bar"]; // args to pass to remote program
  
  // NB remote program needs to support RPC!
  await execAndThen(ns, "/program/foobar.js", "some-host", 100, ...someArgs);
}
