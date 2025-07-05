'use strict';

/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: [
    'lib/index.js',
  ],
  out: 'docs',
  cleanOutputDir: true,
  sidebarLinks: {
    Pug: 'https://pugjs.org/',
    GitHub: 'https://github.com/hildjj/xmlpug/',
    Documentation: 'http://hildjj.github.io/xmlpug/',
  },
  navigation: {
    includeCategories: false,
    includeGroups: false,
  },
  categorizeByGroup: false,
  sort: ['static-first', 'alphabetical'],
  exclude: ['**/*.spec.ts'],
};
