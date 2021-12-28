import { fetchConfig } from "/lib/gh.js";
import { placeFile } from "/lib/fs.js";

/** @param {NS} ns */
export async function main(ns) {
  let { filesToDownload } = await fetchConfig(ns);
  for (const file of filesToDownload) {
    await placeFile(ns, '/' + file);
  }
}
