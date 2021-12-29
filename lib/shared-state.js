export function get(ns, key)
{
  let port = ns.getPortHandle(20);
  if (port.empty()) {
	  port.write({});
  }
  let blackboard = port.read();
  port.write(blackboard);

  if (blackboard[key] === undefined) {
	  blackboard[key] = {};
  }
  return blackboard[key];
}
