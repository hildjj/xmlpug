'use strict'

const fs = require('fs')
const stream = require('stream');
const {Command, InvalidArgumentError} = require('commander')
const pug = require('pug')
const pkg = require('../package.json')
const xmlpug = require('./index')
const {combine} = require('./utils')

const DEFAULT_CONFIG = './.xmlpug.json'

/**
 * Read config file, if it exists.
 *
 * @param {string} config File name.
 * @returns {Promise<object>} Parsed JSON.
 * @ignore
 */
async function readConfig(config) {
  let data = null
  if (!config) {
    return {}
  }
  try {
    data = await fs.promises.readFile(config, 'utf8')
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

/**
 * Read a stream to completion.
 *
 * @param {stream.Readable} str The stream to read.
 * @returns {Promise<string>} The concatenated contents of the string.
 */
function readStream(str) {
  return new Promise((resolve, reject) => {
    let ret = ''
    str.on('error', reject)
    str.on('data', d => (ret += d))
    str.on('end', () => resolve(ret))
  })
}

function define(v, prev) {
  const m = v.match(/(?<name>[^=]+)\s*=\s*(?<value>.*)/)
  if (!m) {
    throw new InvalidArgumentError('Should be "name=value"')
  }
  prev[m.groups.name] = m.groups.value
  return prev
}

/**
 * XmlPug command line interface.
 */
class XmlPugCommand extends Command {
  constructor() {
    super()

    /** @type {stream.Readable} */
    this.defaultIn = process.stdin

    /** @type {stream.Writable} */
    this.defaultOut = process.stdout

    /** @type {stream.Writable} */
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
        '-D, --define <name=string>',
        'Define a global variable',
        define,
        {}
      )
      .option('-o, --output <file>', 'Output file', '-')
      .option('-p, --pretty', 'Pretty print')
      .option('-q, --doublequote', 'Use doublequotes instead of single')
      .option('--html', 'HTML output; only useful for pretty printing')
      .option('--xml', 'Force XML output for XHTML')
  }

  /**
   * Run the CLI.
   *
   * @param {string[]} argv The arguments.  The first two must be the node
   *   runtime and the script name.
   * @returns {Promise<void>}
   */
  async main(argv) {
    const cliOpts = this.parse(argv).opts()
    const [pugFileName, ...inputs] = this.args

    const opts = combine(
      await readConfig(cliOpts.config),
      cliOpts,
      {
        inputs,
        'dentin-doublequote': Boolean(cliOpts.doublequote),
        // 'dentin-colors': false, // TODO: make this an option and detect
      }
    )

    if (opts.inputs.length === 0) {
      opts.inputs.push('-')
    }

    if (opts.html ||
        ((opts.output != null) && opts.output.match(/\.html?$/))) {
      opts.html = true
    }

    const outFile = (opts.output === '-') ?
      this.defaultOut :
      fs.createWriteStream(opts.output)

    const pugData = await fs.promises.readFile(pugFileName)
    const pugFunc = pug.compile(pugData, {
      ...opts,
      filename: pugFileName,
    })
    for (const xmlFileName of opts.inputs) {
      const xmlStream = (xmlFileName === '-') ?
        this.defaultIn :
        fs.createReadStream(xmlFileName)
      const xmlData = await readStream(xmlStream)
      const output = await xmlpug.transform(
        pugFunc,
        xmlData,
        {
          ...opts,
          xmlFileName,
          pugData,
          pugFileName,
        }
      )
      outFile.write(output)
    }
  }
}

module.exports = XmlPugCommand
