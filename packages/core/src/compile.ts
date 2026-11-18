import { Compiler } from "inkjs/compiler/Compiler";
import { CompilerOptions } from "inkjs/compiler/CompilerOptions";
import { JsonFileHandler } from "inkjs/compiler/FileHandler/JsonFileHandler";
import type { Story as ParsedStory } from "inkjs/compiler/Parser/ParsedHierarchy/Story";
import type { FlowBase } from "inkjs/compiler/Parser/ParsedHierarchy/Flow/FlowBase";

export type FlowKind = "knot" | "stitch" | "function";

export interface FlowInfo {
  /** Runtime path, e.g. "campfire" or "campfire.late". */
  path: string;
  kind: FlowKind;
  flow: FlowBase;
}

export interface CompiledStory {
  /** Compiled runtime JSON, loadable by inkjs `Story`. */
  json: string;
  parsed: ParsedStory;
  flows: Map<string, FlowInfo>;
  /** Global VAR and LIST variable names. */
  globals: string[];
  externals: string[];
  /** Ink features that affect how the state space should be explored. */
  features: { random: boolean; turns: boolean };
  warnings: string[];
}

export interface CompileOptions {
  /** Name of the main file. Defaults to "main.ink". */
  fileName?: string;
  /** Other files reachable through INCLUDE, keyed by name. */
  includes?: Record<string, string>;
}

export class InkCompileError extends Error {
  constructor(readonly errors: string[]) {
    super(`Ink compilation failed:\n${errors.join("\n")}`);
    this.name = "InkCompileError";
  }
}

export function compileInk(source: string, options: CompileOptions = {}): CompiledStory {
  const fileName = options.fileName ?? "main.ink";
  const fileHandler = new JsonFileHandler({ ...options.includes, [fileName]: source });
  // countAllVisits so every knot's visit count is tracked in story state.
  const compiler = new Compiler(source, new CompilerOptions(fileName, [], true, null, fileHandler));

  let runtime;
  try {
    runtime = compiler.Compile();
  } catch (err) {
    if (compiler.errors.length > 0) throw new InkCompileError(compiler.errors);
    throw err;
  }
  if (compiler.errors.length > 0 || !runtime) throw new InkCompileError(compiler.errors);

  const json = runtime.ToJson() as string;
  const parsed = compiler.parsedStory;

  return {
    json,
    parsed,
    flows: collectFlows(parsed),
    globals: [...parsed.variableDeclarations.keys()],
    externals: [...parsed.externals.keys()],
    features: detectFeatures(json),
    warnings: [...compiler.warnings],
  };
}

function collectFlows(parsed: ParsedStory): Map<string, FlowInfo> {
  const flows = new Map<string, FlowInfo>();
  for (const [knotName, knot] of parsed.subFlowsByName) {
    flows.set(knotName, { path: knotName, kind: knot.isFunction ? "function" : "knot", flow: knot });
    for (const [stitchName, stitch] of knot.subFlowsByName) {
      const path = `${knotName}.${stitchName}`;
      flows.set(path, { path, kind: "stitch", flow: stitch });
    }
  }
  return flows;
}

/**
 * Control commands are serialized as bare strings inside content arrays
 * ("rnd" for RANDOM, "seq" for shuffles, "turn"/"turns" for TURNS/TURNS_SINCE).
 * Text is prefixed with "^", and names only appear as object keys or values.
 */
function detectFeatures(json: string): CompiledStory["features"] {
  const commands = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) {
        if (typeof item === "string") commands.add(item);
        else walk(item);
      }
    } else if (node !== null && typeof node === "object") {
      for (const value of Object.values(node)) walk(value);
    }
  };
  walk(JSON.parse(json).root);
  return {
    random: commands.has("rnd") || commands.has("seq"),
    turns: commands.has("turn") || commands.has("turns"),
  };
}
