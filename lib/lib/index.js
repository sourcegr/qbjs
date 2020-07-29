'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function commaStringToArray(str) {
  return str.split(',').map(x => x.trim());
}

exports.commaStringToArray = commaStringToArray;