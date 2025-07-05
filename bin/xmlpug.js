#!/usr/bin/env node

import XmlPugCommand from '../lib/cmd.js';

const cmd = new XmlPugCommand();
cmd
  .main(process.argv)
  .catch(er => {
    console.error(er);
    process.exit(1);
  });
