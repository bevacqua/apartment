'use strict';

var _ = require('lodash');
var css = require('css');

function toRegExp (text) { return new RegExp(text); }
function toRegExpExact (text) { return new RegExp('^' + text + '$'); }

function api (stylesheet, options) {
  var sheet = css.parse(stylesheet);
  var sheetRules = sheet.stylesheet.rules;
  var o = options || {};

  if (!Array.isArray(o.properties)) { o.properties = []; }
  if (!Array.isArray(o.selectors)) { o.selectors = []; }

  var props = o.properties.map(toRegExpExact);
  var selectors = o.selectors.map(toRegExp);

  _.forEachRight(sheetRules, inspectRuleset);

  return result();

  function inspectRuleset (inspected, parent) {
    var forEachVictim = typeof parent === 'number';
    if (forEachVictim) {
      parent = false;
    }
    if (inspected.type === 'rule') {
      if (parent) {
        _(sheetRules)
          .where({ type: 'media', media: parent.media })
          .pluck('rules')
          .value()
          .forEach(inspectRules);
      } else {
        inspectRules(sheetRules);
      }
    } else if (inspected.type === 'media') {
      inspected.rules.forEach(inspectRulesetInMedia);
    }

    function inspectRulesetInMedia (rule) {
      inspectRuleset(rule, inspected);
    }

    function inspectRules (rules) {
      _.forEach(rules, inspectDeclarations);
      _.remove(rules, matchesSelector);
    }

    function inspectDeclarations (rule) {
      if (rule.declarations) {
        rule.declarations = rule.declarations.filter(keepPropertyDeclaration);
      }
    }

    function matchesSelector (rule) {
      return _.some(rule.selectors, function (selector) {
        return _.some(selectors, function (comparer) {
            return comparer.test(selector);
          });
      });
    }

    function keepPropertyDeclaration (declaration) {
      return props.every(notMatching);
      function notMatching (prop) {
        return prop.test(declaration.property) === false;
      }
    }
  }

  function result () {
    return css
      .stringify(sheet)
      .replace(/^\n*/, '')
      .replace(/\n*$/, '\n');
  }
}

module.exports = api;
