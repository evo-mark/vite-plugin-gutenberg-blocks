import { PluginContext } from 'rollup';
import postcss from "postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import type { EmittedAsset } from "./generateBundle";


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
export async function transform(this: PluginContext, code: string, id: string) {
        if (/\.css/i.test(id) === false) return;
        const cssFilePath = id
            .replace(process.cwd() + "/src", "")
            .replace(/\\/g, "/")
            .replace("/", "");

        const output = await postcss([cssnano, autoprefixer]).process(code);

        this.emitFile({
            type: "asset",
            fileName: cssFilePath,
            source: output.css,
        } satisfies EmittedAsset);
};
