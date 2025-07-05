import {readFile, unlink} from 'node:fs/promises';
import {Transform} from 'node:stream';
import XmlPugCommand from '../lib/cmd.js';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import test from 'ava';

const __dirname = fileURLToPath(new URL('./', import.meta.url));
const PUG = join(__dirname, '..', 'examples', 'test.pug');
const PROLOG = [
  process.execPath,
  'xmlpug',
  '--no-colors',
];

class Buf extends Transform {
  constructor(opts = {}) {
    const {errorToThrow, ...others} = opts;
    super({
      ...others,
      encoding: 'utf8',
    });
    this.errorToThrow = errorToThrow;
  }

  _transform(chunk, _encoding, cb) {
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
  const out = join(__dirname, '..', 'examples', 'test.html');
  try {
    await unlink(out);
  } catch (ignored) {
    // File didn't already exist, probably because a test failed earlier
  }
  const cli = new XmlPugCommand();
  cli.exitOverride();
  await cli.main([
    ...PROLOG,
    PUG,
    join(__dirname, '..', 'examples', 'test.xml'),
    '-o',
    out,
    '-p',
  ]);

  const outdata = await readFile(out, 'utf8');
  t.regex(outdata, /<html/);
});

test('help', async t => {
  const cli = new XmlPugCommand();
  cli.exitOverride();
  cli.defaultOut = new Buf();
  await t.throwsAsync(() => cli.main([
    ...PROLOG,
    '-h',
  ]), {
    code: 'commander.helpDisplayed',
  });
  t.is(cli.defaultOut.read(), `\
Usage: xmlpug [options] <template> [input...]

Options:
  -V, --version               output the version number
  -c, --config <file>         Config file to read (default: "./.xmlpug.json")
  -C, --colors                Force color output
  --no-colors                 Force non-color output
  -d, --debug                 Add Pug debug information
  -D, --define <name=string>  Define a global variable (default: {})
  -o, --output <file>         Output file (default: "-")
  -p, --pretty                Pretty print
  -q, --doublequote           Use doublequotes instead of single
  --html                      HTML output; only useful for pretty printing
  --xml                       Force XML output for XHTML
  -h, --help                  display help for command
`);
});

test('bad option', async t => {
  const cli = new XmlPugCommand();
  cli.exitOverride();
  cli.defaultErr = new Buf();
  await t.throwsAsync(() => cli.main([
    ...PROLOG,
    '--output',
  ]), {code: 'commander.optionMissingArgument'});
  t.is(
    cli.defaultErr.read(),
    'error: option \'-o, --output <file>\' argument missing\n'
  );

  const cli2 = new XmlPugCommand();
  cli2.exitOverride();
  let out = '';
  cli2.configureOutput({
    writeErr(str) {
      out += str;
    },
  });
  await t.throwsAsync(() => cli2.main([
    ...PROLOG,
    '-D foo',
  ]), {code: 'commander.invalidArgument'});
  t.is(out, 'error: option \'-D, --define <name=string>\' argument \' foo\' is invalid. Should be "name=value"\n');
});

test('stdinout', async t => {
  const cli = new XmlPugCommand();
  cli.exitOverride();
  cli.defaultIn = Buf.from('<foo>huh</foo>\n');
  cli.defaultOut = new Buf();
  await cli.main([
    ...PROLOG,
    join(__dirname, 'bar.pug'),
  ]);
  t.is(cli.defaultOut.read(), `\
<?xml version='1.0'?>
<bar>huh</bar>
`);
});

test('bad config', async t => {
  const cli = new XmlPugCommand();
  cli.exitOverride();
  cli.defaultIn = Buf.from('<foo>huh</foo>');
  cli.defaultOut = new Buf();
  await t.throwsAsync(() => cli.main([
    ...PROLOG,
    '-c',
    join(__dirname, 'bar.pug'), // Invalid JSON
    join(__dirname, 'bar.pug'),
  ]));

  const cli2 = new XmlPugCommand();
  cli2.exitOverride();
  cli2.defaultIn = Buf.from('<foo>huh</foo>');
  cli2.defaultOut = new Buf();
  await cli2.main([
    ...PROLOG,
    '-c',
    '', // Ignore empty
    join(__dirname, 'bar.pug'),
  ]);
  t.is(cli2.defaultOut.read(), `\
<?xml version='1.0'?>
<bar>huh</bar>
`);

  // Calling readFile of a director on BSD returns successfully with something
  // not specified in the docs.
  if (['freebsd', 'openbsd'].indexOf(process.platform) === -1) {
    const cli3 = new XmlPugCommand();
    cli3.exitOverride();
    await t.throwsAsync(() => cli3.main([
      ...PROLOG,
      join(__dirname, 'bar.pug'),
      '-c',
      '.',
    ]), {code: 'EISDIR'});
  }
});

test('define', async t => {
  const cli = new XmlPugCommand();
  cli.exitOverride();
  cli.defaultOut = new Buf();
  await cli.main([
    ...PROLOG,
    PUG,
    join(__dirname, '..', 'examples', 'test.xml'),
    '-c',
    join(__dirname, '..', 'examples', 'config.json'),
    '-D',
    'other=old',
    '-D',
    'test=foo',
  ]);
  const out = cli.defaultOut.read();
  t.is(typeof out, 'string');
});
