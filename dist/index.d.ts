import { generateBundle } from "./bundle";
import { options, outputOptions } from "./resolve";
export declare const createViteBlock: (pluginConfig?: {}) => (import("vite").PluginOption[] | {
    name: string;
    config: (config: any, { command }: {
        command: any;
    }) => {
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
            rollupOptions: {
                input: string;
            };
        };
    };
    options: typeof options;
    outputOptions: typeof outputOptions;
    generateBundle: typeof generateBundle;
})[];
