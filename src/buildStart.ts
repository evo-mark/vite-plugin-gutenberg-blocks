import { build as esBuild } from "esbuild";
import { resolve } from "node:path";
import type { WordpressBlockJson } from "./transform";

export function sideload(
  blockJson: WordpressBlockJson,
  outputDirectory: string
) {
  // Load the block.json options for "script" (frontend/backend) and "viewScript" (frontend)
  const viewScript = blockJson.viewScript;
  const standardScript = blockJson.script;
  // Normalise into array
  const standardScripts = Array.isArray(standardScript)
    ? standardScript
    : [standardScript];

  // Combine arrays into array of files
  const viewScripts = (Array.isArray(viewScript) ? viewScript : [viewScript])
    .concat(standardScripts)
    .filter((script) => script.startsWith("file"))
    .map((script) => {
      return script.replace("file:./", "");
    });

  for (const script of viewScripts) {
    const scriptPath = resolve(`${process.env.PWD}/src/${script}`);
    // Vite won't track this file for watching, so we'll add a manual watcher
    this.addWatchFile("./src/" + script);
    // Build the script as a sideloaded file that isn't injected into the main bundle
    esBuild({
      entryPoints: [scriptPath],
      outfile: outputDirectory + "/" + script,
      platform: "browser",
      bundle: true,
    });
  }
}
