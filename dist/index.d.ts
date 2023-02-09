import type { PluginContext } from "rollup";
import { generateBundle } from "./generateBundle";
import { options } from "./options";
import { outputOptions } from "./outputOptions";
import { transform } from "./transform";
interface PluginConfig {
    watch?: string[];
}
export declare const createViteBlock: (pluginConfig?: PluginConfig) => (import("vite").PluginOption[] | {
    name: string;
    config: () => {
        define: {
            "process.env.NODE_ENV": string;
        };
        build: {
            lib: {
                entry: string;
                name: string;
                formats: string[];
                fileName: () => string;
            };
            outDir: string;
            rollupOptions: {};
            target: string;
            minify: boolean;
            cssCodeSplit: boolean;
        };
    };
    options: typeof options;
    outputOptions: typeof outputOptions;
    buildStart: (this: PluginContext) => void;
    transform: typeof transform;
    generateBundle: typeof generateBundle;
})[];
export {};
