export declare const config: (config: any, { command }: {
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
