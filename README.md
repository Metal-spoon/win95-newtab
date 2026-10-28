<div align='center'><img align='center' src='./src/assets/img/icon_store.png' width='64'/></div>
<h1 align='center'> Win95 newtab </h1>
<p align='center'>Win95 newtab is a customizeable themed newtab page inspired by windows 95/vaporwave.
<div align='center'>
<a href='https://chrome.google.com/webstore/detail/win95-newtab/jldkfnpihcmhefmocabimamogcmmmeia'><img src='https://user-images.githubusercontent.com/9281807/185161687-2ac54981-7261-40df-9dcf-527415d8843e.png'/></a>
<a href='https://addons.mozilla.org/en-US/firefox/addon/win95-newtab/'><img src='https://user-images.githubusercontent.com/9281807/185161174-39589ab9-d66b-427c-8afc-8558980f2d63.png'/></a>
</div>

# Getting started

To start developing you first need to run a few commands to get set up properly.

This project uses NPM for some basic dependencies and dev tools.

This project uses Gulp.js for defining tasks that aid in development. Every task can be run with `npm run <task>`, so Gulp doesn't need to be installed globally.

The main dependencies are Jquery and bootstrap.

To get started run these commands:

```
npm install
npm run compileStyle
npm run prepareLibs
```

To recompile the sass automatically while you work:

```
npm run watch
```

### Creating a release archive

To create a release version use the following command:

```
npm run prepareRelease
```

This will first copy everything over to the dist folder, compiles the sass and then packs it into a timestamped zip.

The result can be found in the release archive folder.

## Debugging

To debug, install the src version of the extension.

### Chrome

Go to settings -> extensions -> load unpacked -> select the src folder

### Firefox

Go to settings -> extensions and themes -> press the cog wheel top right -> debug addons -> load temporary addon -> select manifest.json in the src folder

## Testing

Unit tests use [Vitest](https://vitest.dev) with jsdom and a mocked `chrome` API (`test/mocks/chrome.js`), so no browser is needed. Tests live next to the code they test as `*.spec.js` files.

Run all tests once:

```
npm test
```

Rerun tests on every change:

```
npm run test:watch
```

Run all tests with a coverage report (the HTML report is written to `coverage/`):

```
npm run coverage
```

# Contributing guidelines

I opted to use a eslint to enforce a consistent codestyle. The repo includes the eslint config files and it will thus be enforced.

To make it easier you can use the prettier eslint vscode extension which automatically formats your code based on the eslint config.
It's available in npm aswell if you want to use that instead.

For html and sass there really are no guidelines at the moment.

# FAQ

### Why no webpack or any other bundler?

This is something i want to move to eventually, i've tried before but it was too much of a headache.

### Why Jquery and not a framework like Vue, angular, etc?

I wanted to keep this extension as light as possible, however,
since refactoring a thing or two i realize going with something like vue might not have been such a bad idea.

I might try and port it to vue somewhere down the line and see how it performs.

# Copyright

I do **not** own any of the assets found in this repo, this includes icons, wallpapers, fonts, libraries, etc.
All rights belong to their respective owners.

You are free to do whatever with my code.
