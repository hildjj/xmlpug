'use strict';

const test = require('ava')
const {execFile} = require('child_process')
const fs = require('fs/promises')
const path = require('path')
const XmlPugCommand = require('../lib/cmd')
const {Transform} = require('stream')

const XMLPUG = path.join(__dirname, '..', 'bin', 'xmlpug')
const PUG = path.join(__dirname, '..', 'examples', 'test.pug')
const PROLOG = [
  process.execPath,
  'xmlpug',
]

class Buf extends Transform {
  constructor(opts = {}) {
    const { errorToThrow, ...others } = opts;
    super({
      ...others,
      encoding: "utf8",
    });
    this.errorToThrow = errorToThrow;
  }

  _transform(chunk, encoding, cb) {
    if (this.errorToThrow) {
      cb(this.errorToThrow);
    } else {
      this.push(chunk);
      cb();
    }
  }

  static from(str) {
    return new Buf().end(str);
  }
}

test('run', async t => {
  const out = path.join(__dirname, '..', 'examples', 'test.html');
  try {
    await fs.unlink(out)
  } catch (ignored) {}
  const cli = new XmlPugCommand()
  cli.exitOverride()
  await cli.main([
    ...PROLOG,
    PUG,
    path.join(__dirname, '..', 'examples', 'test.xml'),
    '-o',
    out,
    '-p'
  ])

  const outdata = await fs.readFile(out, 'utf8');
  t.regex(outdata, /<html/)
})

test('help', async t => {
  const cli = new XmlPugCommand()
  cli.exitOverride()
  cli.defaultOut = new Buf()
  await t.throwsAsync(() => cli.main([
    ...PROLOG,
    '-h'
  ]), {
    code: 'commander.helpDisplayed'
  });
  t.is(cli.defaultOut.read(), `\
Usage: xmlpug [options] <template> [input...]

Options:
  -V, --version               output the version number
  -c, --config <file>         Config file to read (default: "./.xmlpug.json")
  -d, --debug                 Add Pug debug information
  -D, --define [name=string]  Define a global variable (default: {})
  -o, --output [file]         Output file (default: "-")
  -p, --pretty                Pretty print
  -q, --doublequote           Use doublequotes instead of single
  --html                      HTML output; only useful for pretty printing
  --xml                       Force XML output for XHTML
  -h, --help                  display help for command
`)
})

test('stdinout', async t => {
  const cli = new XmlPugCommand()
  cli.exitOverride()
  cli.defaultIn = Buf.from('<foo>huh</foo>\n')
  cli.defaultOut = new Buf()
  await cli.main([
    ...PROLOG,
    path.join(__dirname, 'bar.pug'),
  ])
  t.is(cli.defaultOut.read(), `\
<?xml version='1.0'?>
<bar>huh</bar>
`)
})
