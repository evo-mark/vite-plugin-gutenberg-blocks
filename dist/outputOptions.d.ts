import type { OutputOptions } from "rollup";
export declare const wordpressMatch: RegExp;
export declare const external: Record<string, string>;
/**
 * Returns a custom global resolver that maps external libraries and objects to their `window` counterparts
 */
export declare function outputOptions(outputOptions: OutputOptions): void;
