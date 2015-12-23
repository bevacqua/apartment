'use strict';

var _ = require('lodash');
var css = require('css');

function toRegExp (text) {
  return new RegExp('^' + text + '$');
}

function api (stylesheet, options) {
  var sheet = css.parse(stylesheet);
  var sheetRules = sheet.stylesheet.rules;
  var props = options.properties.map(toRegExp);

  _.forEach(sheetRules, inspectRuleset);

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
    }

    function inspectDeclarations (rule) {
      if (rule.declarations) {
        rule.declarations = rule.declarations.filter(keepPropertyDeclaration);
      }
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
