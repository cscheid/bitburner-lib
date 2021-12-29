import { fetchConfig } from "/lib/gh.js";
import { placeFile } from "/lib/fs.js";

export async function copyAll(ns)
{
  let { filesToDownload } = await fetchConfig(ns);
  for (const file of filesToDownload) {
    await placeFile(ns, '/' + file);
  }
}

/** @param {NS} ns */
export async function main(ns) {
  await copyAll(ns);
}
