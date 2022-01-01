import { execAndThen } from "/lib/rpc/api.js";

async function test(ns)
{
  let someArgs = ["foo", "bar"]; // args to pass to remote program
  
  // NB remote program needs to support RPC!
  let result = await execAndThen(ns, "/program/foobar.js", "some-host", 100, ...someArgs);

  // The neat thing about these RPCs is they don't need to be serially
  // called, because they happen on separate processes. So this one process
  // gets to effectively call 
  

  // here's a minimal new dremel assuming a hack time of 1

  while (1) {
    const hack = async () => {
      ns.sleep(3000);
      await execAndThen(ns, "remote-hack");
    };
    const weaken = async () => {
      await execAndThen(ns, "remote-weaken");
    };
    const grow = async () => {
      ns.sleep(800);
      await execAndThen(ns, "remote-grow");
    };

    await Promise.all([hack, weaken, grow].map(x => x()));
  }
}
