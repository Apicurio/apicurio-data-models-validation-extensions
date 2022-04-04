import { Optional } from "@stoplight/types";
import { bundleRuleset } from "@stoplight/spectral-ruleset-bundler";
import { isURL } from "@stoplight/path";
import * as path from "path";
import { createRequire } from "module";
import { isError, isObject } from "lodash";
import { Ruleset, RulesetDefinition } from "@stoplight/spectral-core";

export default async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
  if (rulesetFile === void 0) {
    throw new Error("No ruleset has been found.");
  }

  let ruleset: string;

  try {
    if (isBasicRuleset(rulesetFile)) {
      throw new Error("Basic ruleset type is not supported. Please upgrade ruleset to new format.");
    } else {
      ruleset = await bundleRuleset(rulesetFile, {
        target: "node",
        format: "commonjs",
        plugins: [],
      });
    }
  } catch (e) {
    if (!isError(e) || !isErrorWithCode(e) || e.code !== "UNRESOLVED_ENTRY") {
      throw e;
    }

    throw new Error(`Could not read ruleset at ${rulesetFile}.`);
  }

  return new Ruleset(load(ruleset, rulesetFile), {
    severity: "recommended",
    source: rulesetFile,
  });
}

function load(source: string, uri: string): RulesetDefinition {
  const actualUri = isURL(uri) ? uri.replace(/^https?:\//, "") : uri;
  // we could use plain `require`, but this approach has a number of benefits:
  // - it is bundler-friendly
  // - ESM compliant
  // - and we have no warning raised by pkg.
  const req = createRequire(actualUri);
  const m: { exports?: RulesetDefinition } = {};
  const paths = [path.dirname(uri), __dirname];

  const _require = (id: string): unknown => req(req.resolve(id, { paths }));

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  Function("module, require", source)(m, _require);

  if (!isObject(m.exports)) {
    throw new Error("No valid export found");
  }

  return m.exports;
}

function isBasicRuleset(filepath: string): boolean {
  return /\.(json|ya?ml)$/.test(path.extname(filepath));
}

function isErrorWithCode(error: Error | (Error & { code: unknown })): error is Error & { code: string } {
  return "code" in error && typeof error.code === "string";
}
