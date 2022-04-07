# Spectral Validation Extension for Apicurio Data Models

[Spectral](https://stoplight.io/open-source/spectral/) is a popular open-source JSON/YAML linter by Stoplight.
This extension lets you validate your data models using the Apicurio Data Models library with Spectral [rulesets](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0NA-rulesets).

## Installation and Usage

Install with npm:

```shell
npm install @apicurio/data-models-spectral-validation-extension
```

Load a Spectral ruleset from a configuration file:

```ts
import { SpectralValidationExtension, bundleAndLoadRuleset } from '@apicurio/data-models-spectral-validation-extension';
import { fetch } from '@stoplight/spectral-runtime';
import * as path from 'path';
import * as fs from 'fs';

const rulesetFilepath = path.join(__dirname, ".spectral.yaml");

const spectral = new SpectralValidationExtension({
	ruleset: await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
});
```

Or you can pass in a ruleset object:

```ts
import { SpectralValidationExtension } from '@apicurio/data-models-spectral-validation-extension';
import { truthy } from '@stoplight/spectral-functions';
import { DiagnosticSeverity } from '@stoplight/types';

const spectral = new SpectralValidationExtension({
	ruleset: {
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
	}
});
```

Now you can call `Library.validateDocument(...)` to validate your data model using the Spectral ruleset:

```ts
import { Library, ValidationProblem, ValidationProblemSeverity } from 'apicurio-data-models';

const validationProblems = await Library.validateDocument(document, null, [spectral]);
```