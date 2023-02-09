import { generateBundle } from "./generateBundle";
import { options, outputOptions } from "./resolve";
export declare const createViteBlock: (pluginConfig?: {}) => (import("vite").PluginOption[] | {
    name: string;
    transform(code: string, id: string): Promise<void>;
    config?: undefined;
    options?: undefined;
    outputOptions?: undefined;
    generateBundle?: undefined;
    buildStart?: undefined;
} | {
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
            rollupOptions: {};
        };
    };
    options: typeof options;
    outputOptions: typeof outputOptions;
    generateBundle: typeof generateBundle;
    buildStart: () => void;
})[];
