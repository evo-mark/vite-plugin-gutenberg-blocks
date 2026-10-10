# Migrating to Version 3.x

Most block libraries can upgrade by updating their dependencies (step 1), then checking for one CSS change (step 2) and confirming your sites run WordPress 6.6 or later (step 3). The remaining sections cover smaller changes that only affect some projects.

## Run the migration script

A script can make most of these changes for you. From your development folder, run:

```sh
npx -p vite-plugin-gutenberg-blocks@3 migrate
```

It lists every change and asks before writing anything. Add `--dry-run` to see the list without being asked, or `--yes` to skip the question.

**What it changes:**

- **Dependency versions:** raises the plugin, Vite, React and related packages to the versions version 3 expects, in your development `package.json` and in each block's `package.json`. A dependency is only changed when it's on an older major version.
- **`register-blocks.php`:** replaces it with the new version (see [step 5](#5-faster-block-registration-and-automatic-categories)), but only if you haven't changed it from the 2.x original.
- **Published templates:** if you ran `publish`, updates the `package.json.stub` versions, and replaces `src/index.jsx.stub` if it's unchanged.

**What it reports for you to fix by hand:**

- **Stylesheets that will stop loading:** CSS imported in your blocks' JavaScript but not declared in `block.json` (see [step 2](#2-declare-every-stylesheet-in-blockjson)).
- **A customised `register-blocks.php`:** it won't overwrite your changes.

Afterwards, reinstall your dependencies and rebuild. The sections below explain each change in detail, including the ones the script can't make.

## 1. Update your requirements

Version 3 requires:

| Package    | Version                                       |
| ---------- | --------------------------------------------- |
| WordPress  | 6.6 or later, on every site the blocks run on |
| Node.js    | 22, 24, 25 or 26                              |
| Vite       | 8 or later                                    |
| TypeScript | 6 or later (if you have it installed)         |

The WordPress requirement is new. See [step 3](#3-jsx-now-uses-wordpresss-react-jsx-runtime) for why.

In your development folder's `package.json`, update the plugin and its related packages:

```json
"dependencies": {
	"vite-plugin-gutenberg-blocks": "^3.0.0"
},
"devDependencies": {
	"@vitejs/plugin-react": "^6.0.0",
	"vite": "^8.0.0"
}
```

Also update the plugin version in each block's own `package.json`, then reinstall.

## 2. Declare every stylesheet in `block.json`

**This is the main breaking change.**

In version 2, any CSS imported into your block's JavaScript was injected into the editor with a `<style>` tag, even if `block.json` didn't list it. Version 3 no longer does this. WordPress now loads only the stylesheets that `block.json` declares.

### Check whether you're affected

Build your blocks and look for warnings like this:

```
[plugin vite-plugin-gutenberg-blocks] edit.css is not declared in block.json so WordPress will not load it
```

If a build prints this warning, it also writes an `index.css` file to the block's build folder. WordPress doesn't load that file, so the styles in it no longer appear in the editor. If no warnings appear, you can skip this step.

### Fix your own stylesheets

Add the file to `block.json` under the right key:

| Key           | Where WordPress loads it |
| ------------- | ------------------------ |
| `style`       | Editor and front end     |
| `editorStyle` | Editor only              |
| `viewStyle`   | Front end only           |

For example, if `edit.jsx` imports `./edit.css`:

```json
{
	"editorStyle": ["file:./editor-style.css", "file:./edit.css"]
}
```

Alternatively, `@import` it from a stylesheet that's already declared, and remove the import from your JavaScript.

### Fix stylesheets from `node_modules`

`block.json` can't point at a package's CSS, so `@import` it from a declared stylesheet instead. For example, a carousel block that imported Swiper's CSS in `edit.jsx`:

```jsx
// edit.jsx: remove these lines
import "swiper/css";
import "swiper/css/navigation";
```

```css
/* editor-style.css: add them here */
@import "swiper/css";
@import "swiper/css/navigation";
```

This needs `postcss-import` in your PostCSS config. Projects created with the `create` command already have it.

Once no warnings appear, delete any leftover `index.css` from your build folders.

## 3. JSX now uses WordPress's `react-jsx-runtime`

Version 3 compiles JSX with React's automatic runtime. Your built `index.js` now imports `react/jsx-runtime`, and `index.asset.php` lists `react-jsx-runtime` as a dependency, so WordPress loads it before your block. View scripts written in JSX get the same treatment.

**WordPress added the `react-jsx-runtime` script in version 6.6.** On older sites the dependency doesn't exist, so WordPress won't load your block at all. Make sure every site using your blocks runs WordPress 6.6 or later before you upgrade.

Your source code doesn't need to change. You don't need to import `React` or `createElement` in files that use JSX, though existing imports keep working.

## 4. View scripts now use WordPress's own React and lodash

Scripts listed under `viewScript` or `script` in `block.json` no longer bundle their own copies of these packages:

- `react`
- `react-dom`
- `lodash`
- `lodash-es`
- `jquery`
- `moment`

They now use the copies WordPress already provides, just like your editor scripts. The generated `view.asset.php` lists them as dependencies, so WordPress loads them first.

**No change is needed** if WordPress loads your view scripts through `block.json`, which is the usual setup.

**If you enqueue a view script yourself** with `wp_enqueue_script`, read its dependencies from the generated `.asset.php` file:

```php
$asset = include __DIR__ . '/build/my-block/view.asset.php';

wp_enqueue_script(
	'my-block-view',
	plugins_url('build/my-block/view.js', __FILE__),
	$asset['dependencies'],
	$asset['version'],
	true
);
```

## 5. Faster block registration and automatic categories

Each build now writes a `build/blocks-manifest.php` file containing every block's `block.json`. The new `register-blocks.php` uses it on WordPress 6.8 and later to register all your blocks at once, without reading and parsing each `block.json` on every request. On WordPress 6.6 and 6.7 it registers blocks one by one, as before.

It also registers any block category your blocks use that doesn't exist yet. Blocks made with `create` use your library namespace as their category, which version 2 never registered, so the editor listed them under Uncategorized. The category's title comes from its slug, so `acme-layout` becomes "Acme Layout". To choose your own title or icon, register the category yourself with the `block_categories_all` filter, and `register-blocks.php` will leave it alone.

`init` copied `register-blocks.php` into your plugin folder, so upgrading the package doesn't update it. The migration script replaces it if you haven't changed it. Otherwise, copy the changes across from [the new version](https://github.com/evo-mark/vite-plugin-gutenberg-blocks/blob/main/stubs/register-blocks.php.stub). Your blocks keep working with the old file, but without these improvements.

## 6. Workarounds you can now remove

Version 3 fixes several bugs that you may have worked around.

- **Default imports in view scripts now work.** `import domReady from "@wordpress/dom-ready"` previously produced an empty object. If you replaced it with `window.wp.domReady`, you can switch back to the import.
- **Hyphenated `@wordpress/*` packages in view scripts now resolve.** Packages such as `@wordpress/dom-ready` and `@wordpress/api-fetch` previously caused a `ReferenceError` at runtime.
- **`lodash-es` dependencies are now listed correctly.** `index.asset.php` previously listed `lodash-es`, a script WordPress doesn't provide, which could stop the block from loading. It now lists `lodash`. If you worked around this with the plugin's `dependencies` option, or by importing `lodash` instead of `lodash-es`, you can remove the workaround.
- **CSS is no longer loaded twice in the editor.** Declared stylesheets were previously loaded from their own file and also injected by `index.js`. If you raised CSS specificity to deal with this, you can lower it again.

## 7. Smaller changes

- **Working directory:** the plugin now finds your block with `process.cwd()` instead of the `PWD` environment variable. Builds started by tools that don't set `PWD`, such as some Windows shells and task runners, now find the right block. If your scripts relied on `PWD` pointing somewhere other than the block folder, run Vite from the block folder instead.
- **`outDir` on Windows:** an `outDir` ending in a backslash is now recognised. Previously the plugin added a second separator.
- **New `migrate` command:** see [Run the migration script](#run-the-migration-script).
- **CLI exit codes:** the `init`, `create` and `publish` commands now exit with code `0` on success instead of `1`. Commands chained after them with `&&` now run.
- **Block names must be lowercase:** `create` now rejects uppercase letters in the company, namespace and block name, matching its error messages and WordPress's naming rules.

## 8. New projects only

These changes affect only projects created with `init` and `create` from now on. Existing blocks don't need to change.

- **New blocks register from `block.json`:** the `index.jsx` template now calls `registerBlockType(metadata.name, { edit, save })` with the `block.json` metadata. Attributes and other settings come from `block.json` instead of being repeated in JavaScript.
- **Updated template dependencies:** the starter `package.json` now uses React 19, Vite 8, Lerna 10 and current `@wordpress/*` packages.
