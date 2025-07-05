import {Command, InvalidArgumentError} from 'commander';
import {createReadStream, createWriteStream, promises} from 'node:fs';
import {combine} from './utils.js';
import {compile} from 'pug';
import {transform} from './index.js';
import {version} from './version.js';

const DEFAULT_CONFIG = './.xmlpug.json';

/**
 * Read config file, if it exists.
 *
 * @param {string} config File name.
 * @returns {Promise<object>} Parsed JSON.
 * @ignore
 */
async function readConfig(config) {
  let data = null;
  if (!config) {
    return {};
  }
  try {
    data = await promises.readFile(config, 'utf8');
  } catch (er) {
    // Ignore config file not existing
    if (er.code === 'ENOENT') {
      return {};
    }
    throw er;
  }
  // Don't ignore JSON parse errors
  return JSON.parse(data);
}

/**
 * Read a stream to completion.
 *
 * @param {NodeJS.ReadableStream} str The stream to read.
 * @returns {Promise<string>} The concatenated contents of the string.
 */
function readStream(str) {
  return new Promise((resolve, reject) => {
    let ret = '';
    str.on('error', reject);
    str.on('data', d => (ret += d));
    str.on('end', () => resolve(ret));
  });
}

function define(v, prev) {
  const [name, value] = v.split(/\s?=\s?/);
  if (!name || !value) {
    throw new InvalidArgumentError('Should be "name=value"');
  }
  prev[name] = value;
  return prev;
}

/**
 * XmlPug command line interface.
 */
class XmlPugCommand extends Command {
  constructor() {
    super();

    /** @type {NodeJS.ReadableStream} */
    this.defaultIn = process.stdin;

    /** @type {NodeJS.WritableStream} */
    this.defaultOut = process.stdout;

    /** @type {NodeJS.WritableStream} */
    this.defaultErr = process.stderr;

    this
      .configureOutput({
        writeOut: c => this.defaultOut.write(c),
        writeErr: c => this.defaultErr.write(c),
      })
      .version(version)
      .argument('<template>')
      .argument('[input...]')
      .option('-c, --config <file>', 'Config file to read', DEFAULT_CONFIG)
      .option('-C, --colors', 'Force color output')
      .option('--no-colors', 'Force non-color output')
      .option('-d, --debug', 'Add Pug debug information')
      .option(
        '-D, --define <name=string>',
        'Define a global variable',
        define,
        {}
      )
      .option('-o, --output <file>', 'Output file', '-')
      .option('-p, --pretty', 'Pretty print')
      .option('-q, --doublequote', 'Use doublequotes instead of single')
      .option('--html', 'HTML output; only useful for pretty printing')
      .option('--xml', 'Force XML output for XHTML');
  }

  /**
   * Run the CLI.
   *
   * @param {string[]} argv The arguments.  The first two must be the node
   *   runtime and the script name.
   * @returns {Promise<void>}
   */
  async main(argv) {
    const cliOpts = this.parse(argv).opts();
    const [pugFileName, ...inputs] = this.args;

    const opts = combine(
      await readConfig(cliOpts.config),
      cliOpts,
      {
        inputs,
        'dentin-doublequote': Boolean(cliOpts.doublequote),
        'dentin-colors': cliOpts.colors,
      }
    );

    if (opts.inputs.length === 0) {
      opts.inputs.push('-');
    }

    if (opts.html ||
        ((opts.output != null) && opts.output.match(/\.html?$/))) {
      opts.html = true;
    }

    const outFile = (opts.output === '-') ?
      this.defaultOut :
      createWriteStream(opts.output);

    const pugData = await promises.readFile(pugFileName, 'utf-8');
    const pugFunc = compile(pugData, {
      ...opts,
      filename: pugFileName,
    });
    for (const xmlFileName of opts.inputs) {
      const xmlStream = (xmlFileName === '-') ?
        this.defaultIn :
        createReadStream(xmlFileName);
      const xmlData = await readStream(xmlStream);
      const output = await transform(
        pugFunc,
        xmlData,
        {
          ...opts,
          xmlFileName,
          pugData,
          pugFileName,
        }
      );
      outFile.write(output);
    }
  }
}

export default XmlPugCommand;
