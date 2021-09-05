'use strict';
const {Command, InvalidArgumentError} = require('commander');
const fs = require('fs')
const pkg = require('../package');
const xmlpug = require('./index');

const DEFAULT_CONFIG = './.xmlpug.json';

async function readConfig(config = DEFAULT_CONFIG) {
  let data = null
  try {
    data = await fs.promises.readFile(config)
  } catch (er) {
    // Ignore config file not existing
    if (er.code === 'ENOENT') {
      return {}
    }
    throw er
  }
  // Don't ignore JSON parse errors
  return JSON.parse(data)
}

function readStream(str) {
  return new Promise((resolve, reject) => {
    let ret = ''
    str.on('error', reject)
    str.on('data', d => ret += d)
    str.on('end', () => resolve(ret))
  })
}

function combine(...args) {
  const out = {}
  for (const opts of args) {
    for (const [k, v] of Object.entries(opts)) {
      switch (typeof out[k]) {
        case 'undefined':
        case 'string':
        case 'number':
          out[k] = v
          break
        case 'object':
          if (!out[k]) {
            // null
            out[k] = v
            break
          }
          if (Array.isArray(out[k])) {
            out[k] = [...out[k], ...v]
            break
          }
          out[k] = combine(out[k], v)
          break
        default:
          throw new Error(`Unknown type "${typeof out[k]}" for key "${k}"`)
      }
    }
  }
  return out
}

function define(v, prev) {
  const m = v.match(/([^=]+)\s*=\s*(.*)/);
  if (!m) {
    throw new InvalidArgumentError("Should be 'name=value'");
  }
  prev[m[1]] = m[2];
  return prev
}

module.exports = class XmlPugCommand extends Command {
  constructor() {
    super()
    this.defaultIn = process.stdin
    this.defaultOut = process.stdout
    this.defaultErr = process.stderr
    this
      .configureOutput({
        writeOut: c => this.defaultOut.write(c),
        writeErr: c => this.defaultErr.write(c),
      })
      .version(pkg.version)
      .argument('<template>')
      .argument('[input...]')
      .option('-c, --config <file>', 'Config file to read', DEFAULT_CONFIG)
      .option('-d, --debug', 'Add Pug debug information')
      .option(
        '-D, --define [name=string]',
        'Define a global variable',
        define,
        {}
      )
      .option('-o, --output [file]', 'Output file', '-')
      .option('-p, --pretty', 'Pretty print')
      .option('-q, --doublequote', 'Use doublequotes instead of single')
      .option('--html', 'HTML output; only useful for pretty printing')
      .option('--xml', 'Force XML output for XHTML')
  }


  async main(argv) {
    const cliOpts = this.parse(argv).opts()
    const opts = combine(
      await readConfig(cliOpts.config),
      cliOpts,
      {
        'dentin-doublequote': Boolean(cliOpts.doublequote),
        // 'dentin-colors': false, // TODO: make this an option and detect
      }
    )
    const [pugFile, ...inputs] = this.args

    if (inputs.length === 0) {
      inputs.push('-')
    }

    if (opts.html ||
        ((opts.output != null) && opts.output.match(/\.html?$/))) {
      opts.html = true;
    }

    const outFile = (opts.output === '-') ?
      this.defaultOut :
      fs.createWriteStream(opts.output)

    for (const xmlFileName of inputs) {
      const xml = await readStream((xmlFileName === '-') ?
        this.defaultIn :
        fs.createReadStream(xmlFileName))
      const output = await xmlpug.transform(await fs.promises.readFile(pugFile), xml, {
        ...opts,
        xmlFileName,
        pugFileName: pugFile
      })
      outFile.write(output);
    }
  }
}
