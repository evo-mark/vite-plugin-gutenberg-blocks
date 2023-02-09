/// <reference types="node" />
import type { SourceMap } from "node:module";
import type { OutputOptions, PluginContext } from "rollup";
export type EmittedAsset = {
    type: 'asset';
    name?: string;
    needsCodeReference?: boolean;
    fileName?: string;
    source?: string | Uint8Array;
};
type AssetInfo = {
    fileName: string;
    name?: string;
    needsCodeReference: boolean;
    source: string | Uint8Array;
    type: "asset";
    code: string;
    imports: string[];
};
type ChunkInfo = {
    code: string;
    dynamicImports: string[];
    exports: string[];
    facadeModuleId: string | null;
    fileName: string;
    implicitlyLoadedBefore: string[];
    imports: string[];
    importedBindings: {
        [imported: string]: string[];
    };
    isDynamicEntry: boolean;
    isEntry: boolean;
    isImplicitEntry: boolean;
    map: SourceMap | null;
    modules: {
        [id: string]: {
            renderedExports: string[];
            removedExports: string[];
            renderedLength: number;
            originalLength: number;
            code: string | null;
        };
    };
    moduleIds: string[];
    name: string;
    referencedFiles: string[];
    type: "chunk";
};
export declare function generateBundle(this: PluginContext, options: OutputOptions, bundle: {
    [fileName: string]: ChunkInfo | AssetInfo;
}): void;
export {};
