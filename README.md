# Vite Plugin: Gutenberg Blocks

Develop a Gutenberg block library powered by Vite, with support for build and watch modes.

## Installation

1. Create a new plugin folder
2. Create a blank `package.json` file and then `npm i -D vite-plugin-gutenberg-blocks`
3. Run `npx init` to create a `development` folder and a `register-blocks.php` file
4. `cd` into `development`
5. Run `npm i` to install the required dependencies
6. Run `npm run create` to create a new Gutenberg block
7. In your plugin's entry PHP file, simply `require_once` the `register-blocks.php` file

From the `development` folder you can now `npm run dev` and `npm run prod` to develop your Gutenberg blocks library with Vite.

## Features

-   Automatic configuration of Vite
-   Copies and creates required assets
-   Externalised PostCSS stylesheet processing
-   Watch mode for developing your block library

## Limitations

-   Hot module reloading is not currently supported
