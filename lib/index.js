'use strict';
const bb = require('bluebird');
const fs = bb.promisifyAll(require('fs'));
const dentToString = require('dentin').dentToString;
const xml = require('libxmljs');
const pug = require('pug');
const pkg = require('../package');

const cache = require('./cache');
const State = require('./state');

function prettify(out, options) {
  const dopts = {};
  for (let k in options) {
    const v = options[k];
    let found = false;
    k = k.replace(/^dentin-/, () => {
      found = true;
      return '';
    });
    if (found) {
      dopts[k] = v;
    }
  }
  if (dopts.html == null) {
    dopts.html = options.html;
  }
  // override if the output is HTML.  If you wanted XHTML,
  // use the --xml switch.  It's much more likely (today) that if the
  // output is doctype HTML, you wanted HTML5, so we're biased
  // that direction.
  if (!dopts.html &&
      !options.xml &&
      out.match(/^\s*<!DOCTYPE[^>]+html/im)) {
    dopts.html = true;
  }

  return dentToString(out, dopts);
}

exports.transform = function transform(pugdata, xmldata, options) {
  if (options == null) {
    options = {
      pretty: true
    };
  }
  const pretty = options.pretty;
  options.pretty = false;
  const pugFunc = (typeof pugdata === 'function') ?
    pugdata :
    pug.compile(pugdata, options);

  let xmldoc = null;
  if (xmldata instanceof xml.Document) {
    xmldoc = xmldata;
    xmldata = xmldoc.toString();
  } else if (xmldata != null) {
    xmldoc = xml.parseXmlString(xmldata, {
      noent: true
    }); // throws on invalid input
  }
  let out = pugFunc(State(pugdata, xmldata, xmldoc, options));
  if (pretty) {
    out = prettify(out, options);
  }
  return out;
};

exports.transformFile = function transformFile(pugFileName, xmlDoc, options) {
  if (options == null) {
    options = {
      pretty: true
    };
  }
  if (options.pugFileName == null) {
    options.pugFileName = pugFileName;
  }
  options.filename = options.pugFileName;

  switch (typeof xmlDoc) {
    case 'string':
      options.xmlFileName = options.xmlFileName || xmlDoc;
      if (xmlDoc === '-') {
        xmlDoc = new bb((res, rej) => {
          const bufs = [];
          process.stdin.on('data', (buf) => bufs.push(buf));
          process.stdin.on('end', () => res(Buffer.concat(bufs)));
          process.stdin.on('error', rej);
        });
      } else {
        xmlDoc = fs.readFileAsync(xmlDoc);
      }
      break;
    case 'object':
      // null is ok.  It will cause other issues downstream.
      if (!options.xmlFilename) {
        if (Buffer.isBuffer(xmlDoc)) {
          options.xmlFileName = 'Buffer';
        } else if (xmlDoc instanceof xml.Document) {
          options.xmlFileName = 'xmlDocument';
        }
      }
      break;
    default:
      throw new Error('Invalid XML input', typeof xmlDoc);
  }

  return bb.all([
    cache.read(pugFileName, (pugdata) => pug.compile(pugdata, options)),
    xmlDoc
  ])
  .spread((pfunc, xdata) => exports.transform(pfunc, xdata, options));
};
