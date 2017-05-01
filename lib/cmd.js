'use strict';
const bb = require('bluebird');
const commander = require('commander');
const fs = bb.promisifyAll(require('fs'));
const pkg = require('../package');
const xmlpug = require('./index');

const DEFAULT_CONFIG = './.xmlpug.json';

function readConfig(opts) {
  if (opts == null) {
    opts = {};
  }
  const ref = opts.config || DEFAULT_CONFIG;
  return fs.readFileAsync(ref).then(function(data) {
    return Object.assign(opts, JSON.parse(data));
  }).catchReturn(opts);
}

module.exports = function cmd(args) {
  const defs = {};
  function define(v) {
    const m = v.match(/([^=]+)\s*=\s*(.*)/);
    if (!m) {
      return console.error('Invalid definition: \'' + v + '\'');
    } else {
      return defs[m[1]] = m[2];
    }
  }
  const program = new commander.Command;
  program
    .version(pkg.version)
    .usage('[options] <template> [input...]')
    .option('-c, --config <file>',
            'Config file to read [' + DEFAULT_CONFIG + ']',
            DEFAULT_CONFIG)
    .option('-d, --debug', 'Add Pug debug information')
    .option('-D, --define [name=string]', 'Define a global variable', define)
    .option('-o, --output [file]', 'Output file')
    .option('-p, --pretty', 'Pretty print')
    .option('-q, --doublequote', 'Use doublequotes instead of single')
    .option('--html', 'HTML output; only useful for pretty printing')
    .option('--xml', 'Force XML output for XHTML')
    .parse(args);

  if (program.args.length < 1) {
    program.help();
  }
  const opts = {
    pretty: program.pretty,
    compileDebug: program.debug,
    config: program.config,
    html: false,
    xml: program.xml,
    'dentin-doublequote': program.doublequote
  };
  if (program.html ||
      ((program.output != null) &&
       program.output.match(/\.html?$/))) {
    opts.html = true;
  }
  const outFile = program.output ?
    fs.createWriteStream(program.output) :
    process.stdout;
  const pugFile = program.args.shift();

  if (program.args.length === 0) {
    program.args = [null];
  }

  return readConfig(opts).then((opts) => {
    if (opts.define != null) {
      opts.define = Object.assign(defs, opts.define);
    } else {
      opts.define = defs;
    }
    return bb.each(program.args, (xml) => {
      return xmlpug.transformFile(pugFile, xml, opts)
      .then((output) => {
        if (output) {
          outFile.write(output);
        }
      });
    });
  }).then(() => {
    if (program.output) {
      outFile.end();
    }
  });
};
