export = XmlPugCommand;
/**
 * XmlPug command line interface.
 */
declare class XmlPugCommand extends Command {
    constructor();
    /** @type {stream.Readable} */
    defaultIn: stream.Readable;
    /** @type {stream.Writable} */
    defaultOut: stream.Writable;
    /** @type {stream.Writable} */
    defaultErr: stream.Writable;
    /**
     * Run the CLI.
     *
     * @param {string[]} argv The arguments.  The first two must be the node
     *   runtime and the script name.
     * @returns {Promise<void>}
     */
    main(argv: string[]): Promise<void>;
}
import { Command } from "commander";
import stream = require("stream");
