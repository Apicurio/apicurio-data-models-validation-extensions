import { DiagnosticSeverity } from '@stoplight/types';
import { Library, ValidationProblem, ValidationProblemSeverity } from 'apicurio-data-models';
import { truthy } from '@stoplight/spectral-functions';
import { SpectralValidationExtension } from '../';
import * as path from 'path';

const oasDocument = {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://petstore.swagger.io/v1',
    },
  ],
  paths: {},
};

describe('Ruleset File', () => {
  test('Load ruleset from static file', async () => {
    const spectral = new SpectralValidationExtension({
      ruleset: path.join(__dirname, '.spectral.js'),
    });

    const document = Library.readDocument(oasDocument);
    const results = await spectral.validateDocument(document);

    commonExpects(results);
  });
});

describe('Ruleset Object', () => {
  test('Load ruleset from object file', async () => {
    const spectral = new SpectralValidationExtension({
      ruleset: {
        rules: {
          'title-required': {
            given: '$.info',
            description: 'Info title is required',
            severity: DiagnosticSeverity.Hint,
            then: {
              function: truthy,
              field: 'title',
            },
          },
        },
      },
    });

    const document = Library.readDocument(oasDocument);
    const results = await spectral.validateDocument(document);

    commonExpects(results);
  });
});

describe('Apicurio Data Models invocation', () => {
  test('Call extension from apicurio-data-models and return both internal library problems and extension problems', async () => {
    const extension = new SpectralValidationExtension({
      ruleset: {
        rules: {
          'title-required': {
            given: '$.info',
            description: 'Info title is required',
            severity: DiagnosticSeverity.Error,
            then: {
              function: truthy,
              field: 'title',
            },
          },
        },
      },
    });

    const openapiData = {
      openapi: '3.0.2',
      info: {},
    };

    const document = Library.readDocument(openapiData);

    await Library.validateDocument(document, null, [extension]);
    const validationCodes = document.getValidationProblemCodes();
    expect(validationCodes.find((c) => c === 'title-required')).toBeDefined(); // extension error code
    expect(validationCodes.find((c) => c === 'INF-001')).toBeDefined(); // internal error code
  });
});

function commonExpects(results: ValidationProblem[]) {
  expect(results).toHaveLength(1);
  const result = results[0];
  expect(result.errorCode).toBe('title-required');
  expect(result.message).toBe('Info title is required');
  expect(result.severity).toBe(ValidationProblemSeverity.ignore);
}
