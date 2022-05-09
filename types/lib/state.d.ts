export = state;
/**
 * Create the "locals" to pass into the pug render function, containing the
 * new XML functions.
 *
 * @param {string} pugdata The source for the pug template.
 * @param {string} xmldata The source for the XML input.
 * @param {xml.Document} xmldoc The parsed version of the XML input.
 * @param {object} options All of the options used.
 * @returns {object} The locals object.
 */
declare function state(pugdata: string, xmldata: string, xmldoc: xml.Document, options: object): object;
import xml = require("libxmljs2");
