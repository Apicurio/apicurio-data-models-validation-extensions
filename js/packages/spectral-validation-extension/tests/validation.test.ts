import { DiagnosticSeverity } from '@stoplight/types';
import { Library, ValidationProblem, ValidationProblemSeverity } from 'apicurio-data-models';
import { truthy } from '@stoplight/spectral-functions';
import { fetch } from '@stoplight/spectral-runtime';
import { SpectralValidationExtension, bundleAndLoadRuleset } from '../';
import * as path from 'path';
import * as fs from 'fs';

const oasDocument = {
  openapi: '3.0.0',
  info: {
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://petstore.swagger.io/v1',
    },
  ],
  paths: {},
};

describe('Ruleset File', () => {
  describe('Node.js', () => {
    test('Load ruleset from static YAML file in Node.js', async () => {
      const rulesetFilepath = path.join(__dirname, ".spectral.yaml");
  
      const spectral = new SpectralValidationExtension({
        ruleset: await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
      });
  
      const document = Library.readDocument(oasDocument);
      const results = await spectral.validateDocument(document);
  
      commonExpects(results);
    });
  
    test('Load ruleset from static JS file in Node.js', async () => {
      const rulesetFilepath = path.join(__dirname, ".spectral.js");
  
      const spectral = new SpectralValidationExtension({
        ruleset: await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
      });
  
      const document = Library.readDocument(oasDocument);
      const results = await spectral.validateDocument(document);
  
      commonExpects(results);
    });
  });

  describe('Browser', () => {
    const myRuleset = 
`rules:
  title-required:
    given: '$.info'
    description: 'Info title is required'
    severity: hint
    then:
      function: truthy
      field: title`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fsMock: any = {
      promises: {
        async readFile(filepath: string) {
          if (filepath === "/.spectral.yaml") {
            return myRuleset;
          }
    
          throw new Error(`Could not read ${filepath}`);
        },
      },
    };

    test('Load ruleset from static YAML file in Browser', async () => {
      const spectral = new SpectralValidationExtension({
        ruleset: await bundleAndLoadRuleset('/.spectral.yaml', { fs: fsMock, fetch })
      });
  
      const document = Library.readDocument(oasDocument);
      const results = await spectral.validateDocument(document);
  
      commonExpects(results);
    });
  
    test('Load ruleset from static JS file in Node.js', async () => {
      const spectral = new SpectralValidationExtension({
        ruleset: await bundleAndLoadRuleset('/.spectral.yaml', { fs: fsMock, fetch })
      });
  
      const document = Library.readDocument(oasDocument);
      const results = await spectral.validateDocument(document);
  
      commonExpects(results);
    });
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
