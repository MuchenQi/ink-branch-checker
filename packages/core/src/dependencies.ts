import { VariableReference } from "inkjs/compiler/Parser/ParsedHierarchy/Variable/VariableReference";
import { FunctionCall } from "inkjs/compiler/Parser/ParsedHierarchy/FunctionCall";
import { Divert } from "inkjs/compiler/Parser/ParsedHierarchy/Divert/Divert";
import { DivertTarget } from "inkjs/compiler/Parser/ParsedHierarchy/Divert/DivertTarget";
import type { ParsedObject } from "inkjs/compiler/Parser/ParsedHierarchy/Object";
import type { CompiledStory } from "./compile";

export interface Dependencies {
  /** Global variables the scene reads, directly or through functions and tunnels it calls. */
  variables: string[];
  /** Knots, stitches, or labels whose visit counts the scene reads. */
  visits: string[];
  /** Flows scanned: the target plus functions, tunnels, and threads it reaches. */
  scanned: string[];
}

/**
 * Statically scan a scene for the story state it depends on. Follows function
 * calls, tunnels, and threads, but not plain diverts that leave the scene.
 */
export function findDependencies(compiled: CompiledStory, target: string): Dependencies {
  const globals = new Set(compiled.globals);
  const variables = new Set<string>();
  const visits = new Set<string>();
  const scanned: string[] = [];
  const queue = [target];

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (scanned.includes(path)) continue;
    const info = compiled.flows.get(path);
    if (!info) continue;
    scanned.push(path);

    for (const ref of info.flow.FindAll(VariableReference)()) {
      if (ref.isConstantReference || ref.isListItemReference) continue;
      if (globals.has(ref.name)) {
        variables.add(ref.name);
        continue;
      }
      // Not a global: either a temp/argument, or a read count of a knot/stitch/label.
      const countPath = ref.runtimeVarRef?.pathForCount?.toString();
      if (countPath) visits.add(countPath);
    }

    for (const call of info.flow.FindAll(FunctionCall)()) {
      if (call.isReadCount || call.isTurnsSince) {
        for (const arg of call.args) {
          const countPath = divertTargetPath(arg);
          if (countPath) visits.add(countPath);
        }
      }
      if (!FunctionCall.IsBuiltIn(call.name)) queue.push(call.name);
    }

    for (const divert of info.flow.FindAll(Divert)()) {
      if (!divert.isTunnel && !divert.isThread) continue;
      const targetPath = divert.targetContent?.runtimePath?.toString();
      if (targetPath) queue.push(targetPath);
    }
  }

  return { variables: [...variables].sort(), visits: [...visits].sort(), scanned };
}

function divertTargetPath(expr: ParsedObject): string | null {
  if (!(expr instanceof DivertTarget)) return null;
  return expr.divert.targetContent?.runtimePath?.toString() ?? null;
}
