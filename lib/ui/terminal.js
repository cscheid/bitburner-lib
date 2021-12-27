export function command(message) {
  const docs = globalThis['document'];
  const terminalInput = docs.getElementById("terminal-input");
  terminalInput.value = message;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode:13, preventDefault: () => null });
}
