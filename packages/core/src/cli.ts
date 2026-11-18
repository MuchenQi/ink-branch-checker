#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "node:util";
import { createClaudeReviewer, DEFAULT_EFFORT, DEFAULT_MODEL, type Effort } from "./claude";
import type { CheckResult, TaskRef } from "./checker";
import { findStyleSheetFile } from "./files";
import { prepareCheck, runCheck, type PreparedCheck } from "./pipeline";

const USAGE = `Usage: ink-check <story.ink> <knot[.stitch]> [options]

Options:
  --voices <file>    Style sheet (default: <story>.voices.md or voices.md next to the story)
  --pin <name>       Extra variable or knot to split states by (repeatable)
  --seed <n>         Story seed to explore (repeatable, default 0)
  --keep-all-up-to <n>  Keep every distinct variable state up to n before merging (default 10)
  --model <id>       Claude model (default ${DEFAULT_MODEL})
  --effort <level>   low | medium | high | xhigh | max (default ${DEFAULT_EFFORT})
  --repeat <n>       Run every request n times and show how often each flag recurs (default 1)
  --dry-run          Print the prompts and exit without calling Claude
  --json             Print the result as JSON
`;

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      voices: { type: "string" },
      pin: { type: "string", multiple: true },
      seed: { type: "string", multiple: true },
      "keep-all-up-to": { type: "string" },
      model: { type: "string" },
      effort: { type: "string" },
      repeat: { type: "string" },
      "dry-run": { type: "boolean" },
      json: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help || positionals.length !== 2) {
    process.stdout.write(USAGE);
    return values.help ? 0 : 1;
  }

  const [inkFile, scene] = positionals;
  const voicesFile = values.voices ?? findStyleSheetFile(inkFile);
  const prepared = prepareCheck(fs.readFileSync(inkFile, "utf8"), scene, {
    fileName: path.basename(inkFile),
    styleSheet: voicesFile ? fs.readFileSync(voicesFile, "utf8") : undefined,
    pin: values.pin,
    keepAllUpTo: values["keep-all-up-to"] ? Number(values["keep-all-up-to"]) : undefined,
    enumerate: values.seed ? { seeds: values.seed.map(Number) } : undefined,
  });
  printSummary(prepared, voicesFile);

  if (values["dry-run"]) {
    console.log(`\n${prepared.scenePrompt.text}`);
    for (const state of prepared.statePrompts) console.log(`\n${state.text}`);
    return 0;
  }

  const model = values.model ?? DEFAULT_MODEL;
  const effort = (values.effort as Effort | undefined) ?? DEFAULT_EFFORT;
  const repeat = values.repeat ? Number(values.repeat) : 1;
  if (!Number.isInteger(repeat) || repeat < 1) throw new Error("--repeat must be a positive whole number");
  const result = await runCheck(prepared, createClaudeReviewer({ model, effort }), { repeat });
  if (values.json) console.log(JSON.stringify(result, null, 2));
  else printResult(result, path.basename(inkFile));
  return result.errors.length > 0 ? 2 : 0;
}

function printSummary(prepared: PreparedCheck, voicesFile: string | null): void {
  const { enumeration, grouping } = prepared;
  console.error(
    `${prepared.scene}: ${enumeration.stats.pathsToTarget} paths, ${grouping.groups.length} distinct states` +
      (grouping.mode === "dependencies" ? " (merged by what the scene reads)" : "") +
      (enumeration.complete ? "" : " (incomplete: exploration caps were hit)"),
  );
  console.error(`Speakers: ${prepared.speakers.join(", ") || "none"}. Style sheet: ${voicesFile ?? "none"}`);
  for (const profile of prepared.profiles) {
    if (!profile.declared) console.error(`No style sheet for ${profile.character}: checking against their other lines only.`);
  }
  for (const warning of enumeration.warnings) console.error(`Warning: ${warning}`);
}

function printResult(result: CheckResult, file: string): void {
  const total = result.statesChecked;
  const repeated = result.runs > 1;
  const count = (n: number) => (repeated ? `, seen ${n}/${result.runs}` : "");
  if (result.flags.length === 0) console.log(`
No flags (voice pass and ${total} states).`);
  for (const flag of result.flags) {
    const where =
      flag.scope === "scene"
        ? "whole scene"
        : flag.allStates
          ? "all states"
          : `states ${flag.findings.map((f) => taskName(f.state) + (repeated ? ` (${f.seenIn}/${result.runs})` : "")).join(", ")} of ${total}`;
    const seen = flag.scope === "scene" ? count(flag.seenIn) : "";
    console.log(`
${file}:${flag.line} ${flag.kind} (${flag.severity}, ${where}${seen})`);
    console.log(`  "${flag.quote}"`);
    for (const f of flag.findings) {
      const label = flag.scope === "scene" ? "" : `[state ${taskName(f.state)}${repeated ? ` ${f.seenIn}/${result.runs}` : ""}] `;
      console.log(`  ${label}${f.problem}`);
      console.log(`    evidence: ${f.evidence}`);
    }
  }
  for (const { task, flag } of result.unplaced) console.log(`
(${taskLabel(task)}, line not found) ${flag.quote}: ${flag.problem}`);
  for (const error of result.errors) {
    console.error(`Error in ${taskLabel(error.task)}${repeated ? ` (run ${error.run + 1})` : ""}: ${error.message}`);
  }
  const u = result.usage;
  console.error(
    `
Tokens: ${u.inputTokens} input, ${u.cacheReadTokens} cache read, ${u.cacheWriteTokens} cache write, ${u.outputTokens} output`,
  );
}

/** 1-based state number for display. */
function taskName(task: TaskRef): string {
  return task === null ? "voice" : String(task + 1);
}

function taskLabel(task: TaskRef): string {
  return task === null ? "voice pass" : `state ${task + 1}`;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
