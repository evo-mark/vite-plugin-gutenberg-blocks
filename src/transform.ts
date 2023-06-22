import { PluginContext } from "rollup";
import postcss from "postcss";
import type { AcceptedPlugin } from "postcss";
import cssnano from "cssnano";
import postscss from "postcss-scss";
import { sep } from "node:path";
import autoprefixer from "autoprefixer";
import type { EmittedAsset } from "./generateBundle";

interface WordpressBlockJson {
  style: string|string[];
  editorStyle: string;
}

/**
 * transform
 *
 * Catches any CSS files imported into the block, normalises their filepath and then emits them as
 * separate files into the final build.
 *
 * Enables each Wordpress build folder to maintain its structure like style.css, editor-style.css et al.
 *
 * @see https://rollupjs.org/plugin-development/#transform
 */
export async function transform(
  this: PluginContext,
  code: string,
  id: string,
  rootDirectory: string,
  blockFile: WordpressBlockJson,
): Promise<string|boolean|void> {
  const isCss = /\.css/i.test(id) === true;
  const isScss = /\.scss/i.test(id) === true;
  if (!isCss && !isScss) return;

  const cssFilePath = id
    .replace(process.cwd() + sep + "src", "")
    .replace(/\\/g, "/")
    .replace("/", "")
    .replace(/\.scss/i, ".css");

  const chain = [cssnano, autoprefixer] as Array<AcceptedPlugin>;
  /* @ts-ignore */
  if (isScss) chain.unshift(postscss);

  const output = await postcss(chain).process(code);

  const style = (Array.isArray(blockFile?.style) ? blockFile?.style : [blockFile?.style]) as Array<string>;
  const editorStyle = [blockFile?.editorStyle];
  const stylesheets = ([...style,editorStyle].flat(Infinity) as string[]).map(s => s.replace("file:.",""));
  const relativeId = id.replace(new RegExp(rootDirectory), "").replace(/\.s?css$/i,".css");
  if (stylesheets.includes(relativeId.replace(/\.s?css^/i,"")) === false) return output.css;

  this.emitFile({
    type: "asset",
    fileName: cssFilePath,
    source: output.css,
  } satisfies EmittedAsset);
}
