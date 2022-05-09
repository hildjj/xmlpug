/**
 * Configuration options for XmlPug, pug, and dentin.
 */
export type XmlPugOptions = {
    /**
     * The name of the file that the
     * pugdata came from.  This is used both for generating good errors if
     * pugdata is a string, as well as resolving "require()", "include", and
     * "extend" calls in a template.
     */
    pugFileName?: string;
    /**
     * The name of the XML file the xmldata came
     * from.  Used for processing Xincludes, etc when xmldata is parsed.
     */
    xmlFileName?: string;
    /**
     * If passed in pugdata is a compiled function
     * this can be the original text of the template.
     */
    pugData?: string;
    /**
     * Pretty-print the XML/HTML output using
     * dentin.
     */
    pretty?: boolean;
    /**
     * If set to true, the tokens and function
     * body are logged to stdout.
     */
    debug?: boolean;
    /**
     * If set to true, the function source
     * will be included in the compiled template for better error messages
     * (sometimes useful in development).
     */
    compileDebug?: boolean;
    /**
     * If set to true, compiled functions are
     * cached. The value of pugFileName will be used as the cache key.
     */
    cache?: boolean;
    /**
     * Inline runtime functions
     * instead of require-ing them from a shared version.
     */
    inlineRuntimeFunctions?: boolean;
    /**
     * Force HTML output.
     */
    html?: boolean;
    /**
     * Force XML output.
     */
    xml?: boolean;
    /**
     * Colorize output with ANSI escapes,
     * suitable for terminal printing.
     */
    dentinColors?: boolean;
    /**
     * Use double quotes for
     * attributes.
     */
    dentinDoubleQuote?: boolean;
    /**
     * In HTML docs, only use quotes
     * around attribute values that require them.
     */
    dentinFewerQuotes?: boolean;
    /**
     * Don't alter whitespace for the text
     * inside these elements.
     */
    dentinIgnore?: string[];
    /**
     * Line length for word wrapping.
     */
    dentinMargin?: number;
    /**
     * Don't output XML version
     * header.
     */
    dentinNoVersion?: boolean;
    /**
     * Number of spaces to indent each level.
     */
    dentinSpaces?: number;
    /**
     * Number of spaces you like after a
     * period.  I'm old, so it's two by default.
     */
    dentinPeriodSpaces?: number;
};
/**
 * Configuration options for XmlPug, pug, and dentin.
 *
 * @typedef {object} XmlPugOptions
 * @property {string} [pugFileName='Pug'] The name of the file that the
 *   pugdata came from.  This is used both for generating good errors if
 *   pugdata is a string, as well as resolving "require()", "include", and
 *   "extend" calls in a template.
 * @property {string} [xmlFileName] The name of the XML file the xmldata came
 *   from.  Used for processing Xincludes, etc when xmldata is parsed.
 * @property {string} [pugData] If passed in pugdata is a compiled function
 *   this can be the original text of the template.
 * @property {boolean} [pretty=true] Pretty-print the XML/HTML output using
 *   dentin.
 * @property {boolean} [debug=false] If set to true, the tokens and function
 *   body are logged to stdout.
 * @property {boolean} [compileDebug=true] If set to true, the function source
 *   will be included in the compiled template for better error messages
 *   (sometimes useful in development).
 * @property {boolean} [cache=false] If set to true, compiled functions are
 *   cached. The value of pugFileName will be used as the cache key.
 * @property {boolean} [inlineRuntimeFunctions=false] Inline runtime functions
 *   instead of require-ing them from a shared version.
 * @property {boolean} [html=false] Force HTML output.
 * @property {boolean} [xml=false] Force XML output.
 * @property {boolean} [dentinColors=false] Colorize output with ANSI escapes,
 *   suitable for terminal printing.
 * @property {boolean} [dentinDoubleQuote=false] Use double quotes for
 *   attributes.
 * @property {boolean} [dentinFewerQuotes=false] In HTML docs, only use quotes
 *   around attribute values that require them.
 * @property {string[]} [dentinIgnore=[]] Don't alter whitespace for the text
 *   inside these elements.
 * @property {number} [dentinMargin=78] Line length for word wrapping.
 * @property {boolean} [dentinNoVersion=false] Don't output XML version
 * header.
 * @property {number} [dentinSpaces=2] Number of spaces to indent each level.
 * @property {number} [dentinPeriodSpaces=2] Number of spaces you like after a
 *   period.  I'm old, so it's two by default.
 */
/**
 * Transform an XML document with a pug template.
 *
 * @param {string|Function} pugdata The pug template to use.
 * @param {string|xml.Document} xmldata The XML Document as source.
 * @param {XmlPugOptions} options Configuration.
 * @returns {string} The transformed document.
 */
export function transform(pugdata: string | Function, xmldata: string | xml.Document, options: XmlPugOptions): string;
import xml = require("libxmljs2");
