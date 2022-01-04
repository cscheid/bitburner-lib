export function command(message) {
  const docs = globalThis['document'];
  const terminalInput = docs.getElementById("terminal-input");
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
