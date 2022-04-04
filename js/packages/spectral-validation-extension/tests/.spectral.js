// .spectral.js (CommonJS)
const { truthy } = require("@stoplight/spectral-functions");
const { DiagnosticSeverity } = require("@stoplight/types");

module.exports = {
  rules: {
    'title-required': {
      given: '$.info',
      description: 'Info title is required',
      severity: DiagnosticSeverity.Hint,
      then: {
        function: truthy,
        field: 'title'
      }
    }
  }
};