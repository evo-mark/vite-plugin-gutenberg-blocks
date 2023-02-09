/**
 * config
 *
 * Provides Vite config settings required to build Gutenberg blocks
 *
 * @see https://vitejs.dev/guide/api-plugin.html#config
 */
export declare const config: () => {
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
