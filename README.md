Use [Jade](https://github.com/visionmedia/jade) to transform XML, instead of
[XSLT](http://www.w3.org/TR/xslt).  Why?  At my office, we call the XSLT book
the *Token of Pain*.  Whoever touched the XSLT code last has it on their desk,
and is responsible for being the current expert.  That person hates their
life until someone else needs the book badly enough to take on the pain.

Also, you can't easily generate HTML5 with XSLT because of the doctype and tags
like `<meta>` that don't get closed.

# Installation

    npm install -g xmljade

# Example

Write templates like this:

```
doctype html
html
  head
    meta(charset='utf-8')
    meta(name='author', content=$$('front/author/@fullname'))
    title= $('front/title/text()')
```

where the `$` and `$$` functions perform xpath queries in a source XML document.  `$` returns the first match, or `null`.  `$$` always returns an array of all of the matches.  So given the following XML input:

```
<rfc>
  <front>
    <title abbrev="HTML RFC">HyperText Markup Language Request For Comments Format</title>
    <author initials="J." surname="Hildebrand" fullname="Joe Hildebrand" role="editor"/>
    <author initials="H." surname="Flanagan" fullname="Heather Flanagan" role="editor"/>
  </front>
</rfc>

```

the above template would generate:

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="author" content="Joe Hildebrand,Heather Flanagan">
    <title>HyperText Markup Language Request For Comments Format</title>
  </head>
</html>
```

# Jade Extensions

The added JavaScript features available in the template are:

- `$(string, element)`: perform an XPath query against the input document, returning the first match.  Text nodes are converted to strings, and attribute nodes are converted to the string versions of their values. If no matches are found, returns `null`.  If an element is provided, search within that element, otherwise search from the root of the input document.
- `$$(string, element)`: perform an XPath query against the input document, returning all of the matches as an array.  Text nodes are converted to strings, and attribute nodes are converted to the string versions of their values. If no matches are found, returns `[]`.  If an element is provided, search within that element, otherwise search from the root of the input document.
- `$att(element, string)`: gets the text value of an attribute from an element with the name specified in the string.  Returns `null` on errors.
- `$source`: a Buffer containing the original XML source before parsing
- `require(string)`: wrapper around normal node `require` allowing it to work in a template
- `version`: the name and version number of xmljade

# Command Line


    Usage: xmljade [options] <template> <input>

    Options:

      -h, --help           output usage information
      -V, --version        output the version number
      -d, --debug          Add Jade debug information
      -o, --output [file]  Output file
      -p, --pretty         Pretty print
