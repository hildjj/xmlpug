function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function ($$, version, $, require, $att, $nsDecls, $root) {
buf.push("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"author\"" + (jade.attr("content", $$('front/author/@fullname'), true, true)) + "><meta name=\"keywords\"" + (jade.attr("content", $$('front/keyword/text()'), true, true)) + "><meta name=\"description\"" + (jade.attr("content", $$('front/abstract/t/text()').join(' '), true, true)) + "><meta name=\"generator\"" + (jade.attr("content", version, true, true)) + "><title>" + (jade.escape(null == (jade_interp = $('front/title/text()')) ? "" : jade_interp)) + "</title></head><body><h1>Examples</h1><p>This document will provide some examples</p>");
var util = require('util')
buf.push("<p>" + (jade.escape(null == (jade_interp = util.format("one:%d", 2)) ? "" : jade_interp)) + "</p>");
var test = require('./test')
buf.push("<p>" + (jade.escape(null == (jade_interp = test.stuff()) ? "" : jade_interp)) + "</p><h2>Loop</h2>");
// iterate $$('middle/section')
;(function(){
  var $$obj = $$('middle/section');
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var s = $$obj[$index];

buf.push("<div" + (jade.attr("id", $att(s, 'anchor'), true, true)) + " class=\"section\">" + (jade.escape(null == (jade_interp = $('@title', s)) ? "" : jade_interp)));
// iterate $$('t/text()', s)
;(function(){
  var $$obj = $$('t/text()', s);
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var t = $$obj[$index];

buf.push("<p>" + (jade.escape(null == (jade_interp = t) ? "" : jade_interp)) + "</p>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var t = $$obj[$index];

buf.push("<p>" + (jade.escape(null == (jade_interp = t) ? "" : jade_interp)) + "</p>");
    }

  }
}).call(this);

buf.push("</div>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var s = $$obj[$index];

buf.push("<div" + (jade.attr("id", $att(s, 'anchor'), true, true)) + " class=\"section\">" + (jade.escape(null == (jade_interp = $('@title', s)) ? "" : jade_interp)));
// iterate $$('t/text()', s)
;(function(){
  var $$obj = $$('t/text()', s);
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var t = $$obj[$index];

buf.push("<p>" + (jade.escape(null == (jade_interp = t) ? "" : jade_interp)) + "</p>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var t = $$obj[$index];

buf.push("<p>" + (jade.escape(null == (jade_interp = t) ? "" : jade_interp)) + "</p>");
    }

  }
}).call(this);

buf.push("</div>");
    }

  }
}).call(this);

buf.push("<h2>all of the attributes</h2><p" + (jade.attrs(jade.merge([$att($('//author'))]), true)) + "></p><p" + (jade.attrs(jade.merge([$att($('//author'), {added: 'one'})]), true)) + "></p><h2>namespaces</h2><p>" + (jade.escape(null == (jade_interp = $nsDecls($('//e:extra', {e: 'urn:example:extra'}))['xmlns']) ? "" : jade_interp)) + "</p><dl>");
// iterate $$('//n:more', {n: 'urn:example:extra'})
;(function(){
  var $$obj = $$('//n:more', {n: 'urn:example:extra'});
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var m = $$obj[$index];

buf.push("<dt>" + (jade.escape(null == (jade_interp = $att(m)['m:a']) ? "" : jade_interp)) + "</dt><dd>");
// iterate $nsDecls(m)
;(function(){
  var $$obj = $nsDecls(m);
  if ('number' == typeof $$obj.length) {

    for (var n = 0, $$l = $$obj.length; n < $$l; n++) {
      var v = $$obj[n];

buf.push((jade.escape(null == (jade_interp = n) ? "" : jade_interp)) + " = " + (jade.escape(null == (jade_interp = v) ? "" : jade_interp)));
    }

  } else {
    var $$l = 0;
    for (var n in $$obj) {
      $$l++;      var v = $$obj[n];

buf.push((jade.escape(null == (jade_interp = n) ? "" : jade_interp)) + " = " + (jade.escape(null == (jade_interp = v) ? "" : jade_interp)));
    }

  }
}).call(this);

buf.push("</dd>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var m = $$obj[$index];

buf.push("<dt>" + (jade.escape(null == (jade_interp = $att(m)['m:a']) ? "" : jade_interp)) + "</dt><dd>");
// iterate $nsDecls(m)
;(function(){
  var $$obj = $nsDecls(m);
  if ('number' == typeof $$obj.length) {

    for (var n = 0, $$l = $$obj.length; n < $$l; n++) {
      var v = $$obj[n];

buf.push((jade.escape(null == (jade_interp = n) ? "" : jade_interp)) + " = " + (jade.escape(null == (jade_interp = v) ? "" : jade_interp)));
    }

  } else {
    var $$l = 0;
    for (var n in $$obj) {
      $$l++;      var v = $$obj[n];

buf.push((jade.escape(null == (jade_interp = n) ? "" : jade_interp)) + " = " + (jade.escape(null == (jade_interp = v) ? "" : jade_interp)));
    }

  }
}).call(this);

buf.push("</dd>");
    }

  }
}).call(this);

buf.push("</dl><p>" + (jade.escape(null == (jade_interp = "lang: " + $att($root(), 'lang')) ? "" : jade_interp)) + "</p></body></html>");}.call(this,"$$" in locals_for_with?locals_for_with.$$:typeof $$!=="undefined"?$$:undefined,"version" in locals_for_with?locals_for_with.version:typeof version!=="undefined"?version:undefined,"$" in locals_for_with?locals_for_with.$:typeof $!=="undefined"?$:undefined,"require" in locals_for_with?locals_for_with.require:typeof require!=="undefined"?require:undefined,"$att" in locals_for_with?locals_for_with.$att:typeof $att!=="undefined"?$att:undefined,"$nsDecls" in locals_for_with?locals_for_with.$nsDecls:typeof $nsDecls!=="undefined"?$nsDecls:undefined,"$root" in locals_for_with?locals_for_with.$root:typeof $root!=="undefined"?$root:undefined));;return buf.join("");
}