import {
  IDocumentValidatorExtension,
  NodePath,
  ValidationProblem,
  ValidationProblemSeverity,
  Node,
  Library,
  Document,
} from "apicurio-data-models";
import { ISpectralDiagnostic, Spectral, RulesetDefinition, Ruleset } from "@stoplight/spectral-core";
import { DiagnosticSeverity } from "@stoplight/types";
import getRuleset from "./getRuleset";

export interface SpectralValidationOptions {
  ruleset: Ruleset | RulesetDefinition | string;
}

/**
 * 
 * An extension that adds Spectral ruleset validation to
 * apicurio-data-models. 
 * 
 * This package is not intended to be executed directly - please see below 
 * on how you can use this with apicurio-data-models
 * 
 * Usage example:
 * 
 * ```
 * import { SpectralValidationExtension } from '@apicurio/data-models-spectral-validation-extension';
 * import { Library } from 'apicurio-data-models';
 * 
 * const spectral = new SpectralValidationExtension({...});
 * 
 * await Library.validateDocument(document, null, [spectral]);
 * ```
 * 
 * @class
 */
export class SpectralValidationExtension implements IDocumentValidatorExtension {
  private spectral: Spectral;
  private options: SpectralValidationOptions;
  private cachedRuleset: Ruleset | RulesetDefinition;
  /**
   * 
   * @param {string} options - Validation configuration options
   * @param {Object|string} options.ruleset - Spectral ruleset. Can be a ruleset object or a path to a ruleset config file
   */
  constructor(options: SpectralValidationOptions) {
    this.spectral = new Spectral();
    this.options = options;
  }

  /**
   * Validate a document using the Spectral API
   * 
   * @param {Object} node - Document to validate
   * @returns list of found validation problems
   * @async
   */
  async validateDocument(node: Node): Promise<ValidationProblem[]> {
    if (this.cachedRuleset === undefined) {
      if (typeof this.options.ruleset == "string") {
        this.cachedRuleset = await getRuleset(this.options.ruleset);
      } else {
        this.cachedRuleset = this.options.ruleset;
      }
      this.setRuleset(this.cachedRuleset);
    }

    const results = await this.spectral.run(Library.writeDocumentToJSONString(node as Document));
    if (!results.length) {
      console.debug("no validation problems found in Spectral validator..");
      return [];
    }
    const validationProblems: ValidationProblem[] = [];

    results.forEach((d: ISpectralDiagnostic) => {
      const pathSegments = d.path.splice(0, d.path.length - 1).join(".");
      validationProblems.push({
        errorCode: String(d.code),
        nodePath: new NodePath("/" + pathSegments),
        message: d.message,
        severity: severityCodeMapConfig[d.severity],
        property: d.path[0].toString(),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        accept: () => {},
      });
    });
    return validationProblems;
  }

  async setRuleset(ruleset: RulesetDefinition | Ruleset) {
    this.spectral.setRuleset(ruleset);
  }
}

// map severity codes from Spectral to Apicurio severity codes
const severityCodeMapConfig: { [key in DiagnosticSeverity]: ValidationProblemSeverity } = {
  0: ValidationProblemSeverity.high,
  1: ValidationProblemSeverity.medium,
  2: ValidationProblemSeverity.low,
  3: ValidationProblemSeverity.ignore,
};
