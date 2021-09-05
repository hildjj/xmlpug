// Example of how to call the API

'use strict';

const xmlpug = require('../');
const libxmljs = require('libxmljs');
const assert = require('assert');

const defaultOptions = {
  config: 'config.json',
  pretty: true,
  html: true
};

xmlpug.readConfig(defaultOptions)
.bind({})
.then((opts) => {
  this.opts = opts;
  return xmlpug.transformFile('test.pug', 'test.xml', opts);
})
.then((res) => {
  assert.equal(typeof res, 'string');
  return xmlpug.transformFile('test.pug',
                              Buffer.from('<foo/>'),
                              this.opts);
})
.then((res) => {
  assert.equal(typeof res, 'string');
  return xmlpug.transform(`
foo
  = $('/bar/text()')
`, Buffer.from('<bar>test</bar>'), this.opts);
})
.then((res) => {
  assert.equal(res, '<foo>test</foo>')
});
