export async function command(ns, message) {
  const docs = globalThis['document'];
  let terminalInput;
  if (message === undefined) {
    // assume not an async call
    message = ns;
  } else {
    while ((terminalInput = docs.getElementById("terminal-input")) === null) {
      await ns.asleep(1000);
    }
  }
  terminalInput = docs.getElementById("terminal-input");
  terminalInput.value = message;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode:13, preventDefault: () => null });
}

export async function realias(ns) {
  for (const file of await ns.ls("home", "/program/")) {
    if (!file.startsWith("/program/")) {
      continue;
    }
    let shortcut = file.slice("/program/".length, -(".js".length));
    ns.tprint("Setting up alias for ${shortcut}");
    await command(`unalias ${shortcut}`);
    await command(`alias ${shortcut}="run ${file}"`);
  }
}
