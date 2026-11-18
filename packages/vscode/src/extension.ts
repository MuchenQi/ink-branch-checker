import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  addStyleRule,
  createClaudeReviewer,
  DEFAULT_EFFORT,
  DEFAULT_MODEL,
  findStyleSheetFile,
  flowAtLine,
  InkCompileError,
  prepareCheck,
  runCheck,
  type CheckResult,
  type Effort,
  type FlagKind,
  type PreparedCheck,
  type SceneFlag,
  type TaskRef,
  type TraceStep,
} from "@gwc/core";

/** The writer's call on a flag. The tool makes no claim that a flag is correct. */
type Verdict = "agree" | "disagree" | "unsure";

const API_KEY_SECRET = "inkBranchChecker.anthropicApiKey";
const SOURCE = "Ink Branch Checker";
const KIND_LABEL: Record<FlagKind, string> = { voice: "Voice", stance: "Stance", fact: "Fact" };
const VERDICT_LABEL: Record<Verdict, string> = { agree: "agree", disagree: "disagree", unsure: "not sure" };

/** Flags currently shown for one document, from the latest check. */
interface ShownFlags {
  scene: string;
  /** One line per incoming state (choices on its shortest path), for the state picker. */
  statePaths: string[];
  entries: { diagnostic: vscode.Diagnostic; flag: SceneFlag }[];
}

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel(SOURCE);
  const diagnostics = vscode.languages.createDiagnosticCollection("ink-branch-checker");
  const shown = new Map<string, ShownFlags>();

  context.subscriptions.push(
    output,
    diagnostics,
    vscode.commands.registerCommand("inkBranchChecker.listIncomingStates", () => listIncomingStates(output)),
    vscode.commands.registerCommand("inkBranchChecker.checkScene", () =>
      checkSceneAtCursor(context, output, diagnostics, shown),
    ),
    vscode.commands.registerCommand("inkBranchChecker.setApiKey", () => setApiKey(context)),
    vscode.commands.registerCommand(
      "inkBranchChecker.judgeFlag",
      (uri: vscode.Uri, index: number, verdict: Verdict, askNote: boolean) =>
        judgeFlag(output, diagnostics, shown, uri, index, verdict, askNote),
    ),
    vscode.languages.registerCodeActionsProvider({ language: "ink" }, new JudgmentActions(shown), {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.contentChanges.length === 0) return;
      diagnostics.delete(e.document.uri);
      shown.delete(e.document.uri.toString());
    }),
  );
}

export function deactivate(): void {}

/** Compile and enumerate the scene under the cursor. Reports problems and returns null on failure. */
function prepareAtCursor(output: vscode.OutputChannel): { doc: vscode.TextDocument; prepared: PreparedCheck } | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return null;
  const doc = editor.document;
  const source = doc.getText();
  const scene = flowAtLine(source, editor.selection.active.line + 1);
  if (!scene) {
    vscode.window.showWarningMessage("Put the cursor inside a knot or stitch.");
    return null;
  }

  output.clear();
  output.show(true);
  try {
    const styleFile = findStyleSheetFile(doc.fileName);
    const prepared = prepareCheck(source, scene, {
      fileName: path.basename(doc.fileName),
      styleSheet: styleFile ? readStyleSheet(styleFile) : undefined,
    });
    const { enumeration, grouping } = prepared;
    output.appendLine(`Scene: ${scene}`);
    output.appendLine(
      `${enumeration.stats.pathsToTarget} paths, ${grouping.groups.length} distinct states` +
        (grouping.mode === "dependencies" ? " (merged by what the scene reads)" : "") +
        (enumeration.complete ? "" : " (incomplete: exploration caps were hit)"),
    );
    output.appendLine(`States differ by: ${[...grouping.relevant.variables, ...grouping.relevant.visits].join(", ") || "nothing"}`);
    output.appendLine(`Speakers: ${prepared.speakers.join(", ") || "none"}`);
    output.appendLine(`Style sheet: ${styleFile ? path.basename(styleFile) : "none"}`);
    for (const profile of prepared.profiles) {
      if (!profile.declared) output.appendLine(`No style sheet for ${profile.character}: checking against their other lines only.`);
    }
    for (const warning of enumeration.warnings) output.appendLine(`Warning: ${warning}`);
    return { doc, prepared };
  } catch (err) {
    output.appendLine(err instanceof InkCompileError ? err.errors.join("\n") : String(err));
    return null;
  }
}

function listIncomingStates(output: vscode.OutputChannel): void {
  const ready = prepareAtCursor(output);
  if (!ready) return;
  const { prepared } = ready;

  for (const profile of prepared.profiles) {
    output.appendLine(
      `Voice: ${profile.character} (${profile.samples.length} of ${profile.totalLines} lines sampled, ` +
        `${profile.rules.length} rules, ${profile.examples.length} examples)`,
    );
  }
  prepared.grouping.groups.forEach((group, i) => {
    output.appendLine("");
    output.appendLine(`State ${i + 1} (${group.pathCount} paths)`);
    for (const [name, value] of Object.entries({ ...group.variables, ...group.visits })) {
      output.appendLine(`  ${name} = ${JSON.stringify(value)}`);
    }
    const example = group.examples[0];
    if (example) output.appendLine(`  e.g. ${describeTrace(example)}`);
  });
}

async function checkSceneAtCursor(
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection,
  shown: Map<string, ShownFlags>,
): Promise<void> {
  const ready = prepareAtCursor(output);
  if (!ready) return;
  const { doc, prepared } = ready;
  const version = doc.version;

  const config = vscode.workspace.getConfiguration("inkBranchChecker");
  const model = config.get<string>("model") || DEFAULT_MODEL;
  const effort = config.get<Effort>("effort") || DEFAULT_EFFORT;
  const repeat = Math.max(1, Math.floor(config.get<number>("repeat") ?? 1));
  const apiKey = await context.secrets.get(API_KEY_SECRET);
  const states = prepared.statePrompts.length;

  let result: CheckResult;
  try {
    const reviewer = createClaudeReviewer({ apiKey, model, effort });
    result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Checking ${prepared.scene} against ${states} incoming states${repeat > 1 ? `, ${repeat} runs` : ""}`,
      },
      () => runCheck(prepared, reviewer, { repeat }),
    );
  } catch (err) {
    output.appendLine(`Could not reach Claude: ${err instanceof Error ? err.message : String(err)}`);
    vscode.window.showErrorMessage(`${SOURCE} could not reach Claude. Run "Ink: Set Anthropic API Key" if no key is set.`);
    return;
  }
  if (result.errors.length === states && states > 0) {
    vscode.window.showErrorMessage(`Every review failed: ${result.errors[0].message}`);
  }

  if (doc.version !== version) {
    output.appendLine("The file changed during the check; results were discarded. Run the check again.");
    return;
  }
  const entries = result.flags.map((flag) => ({ diagnostic: toDiagnostic(doc, flag), flag }));
  const statePaths = prepared.grouping.groups.map((g) => describeTrace(g.examples[0] ?? []));
  shown.set(doc.uri.toString(), { scene: prepared.scene, statePaths, entries });
  diagnostics.set(doc.uri, entries.map((e) => e.diagnostic));
  reportResult(output, prepared, result);
}

function toDiagnostic(doc: vscode.TextDocument, flag: SceneFlag, verdict?: Verdict): vscode.Diagnostic {
  const line = doc.lineAt(flag.line - 1);
  const start = line.text.indexOf(flag.quote);
  const range =
    start >= 0
      ? new vscode.Range(flag.line - 1, start, flag.line - 1, start + flag.quote.length)
      : line.range.with(line.range.start.translate(0, line.firstNonWhitespaceCharacterIndex));

  const where =
    flag.scope === "scene"
      ? "whole scene"
      : flag.allStates
        ? "in every incoming state"
        : `in states ${flag.findings.map((f) => `${(f.state ?? 0) + 1}${flag.runs > 1 ? ` (${f.seenIn}/${flag.runs})` : ""}`).join(", ")}`;
  const repeated = flag.runs > 1;
  const details = flag.findings.map((f) => {
    const seen = repeated ? ` [${f.seenIn}/${flag.runs} runs]` : "";
    return f.state === null
      ? `${f.problem} (${f.evidence})${seen}`
      : `State ${f.state + 1}${seen}: ${f.problem} (${f.evidence})`;
  });
  const footer = verdict ? [`You marked this: ${VERDICT_LABEL[verdict]}`] : [];
  const diagnostic = new vscode.Diagnostic(
    range,
    [
      `${KIND_LABEL[flag.kind]}, ${where}${repeated && flag.scope === "scene" ? `, seen in ${flag.seenIn} of ${flag.runs} runs` : ""}`,
      ...details,
      ...footer,
    ].join("\n"),
    flag.severity === "high" ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information,
  );
  diagnostic.source = SOURCE;
  diagnostic.code = flag.kind;
  return diagnostic;
}

/** Quick fixes on each flag for the writer to say whether they agree with it. */
class JudgmentActions implements vscode.CodeActionProvider {
  constructor(private readonly shown: Map<string, ShownFlags>) {}

  provideCodeActions(doc: vscode.TextDocument, _range: vscode.Range, context: vscode.CodeActionContext): vscode.CodeAction[] {
    const current = this.shown.get(doc.uri.toString());
    if (!current) return [];
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== SOURCE) continue;
      const index = current.entries.findIndex(
        (e) => e.diagnostic.range.isEqual(diagnostic.range) && e.diagnostic.message === diagnostic.message,
      );
      if (index < 0) continue;

      // A line can carry voice, stance, and fact flags at once, so name the flag in every action.
      const label = flagLabel(current.entries[index].flag);
      const choices: [string, Verdict, boolean][] = [
        [`Agree with ${label}`, "agree", false],
        [`Disagree with ${label}, hide it`, "disagree", false],
        [`Not sure about ${label}`, "unsure", false],
        [`Disagree with ${label} and explain why...`, "disagree", true],
      ];
      for (const [title, verdict, askNote] of choices) {
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.command = { title, command: "inkBranchChecker.judgeFlag", arguments: [doc.uri, index, verdict, askNote] };
        actions.push(action);
      }
    }
    return actions;
  }
}

/** "Stance flag (states 1, 2)", "Voice flag (whole scene)". */
function flagLabel(flag: SceneFlag): string {
  const where =
    flag.scope === "scene"
      ? "whole scene"
      : flag.allStates
        ? "all states"
        : `state${flag.findings.length === 1 ? "" : "s"} ${flag.findings.map((f) => (f.state ?? 0) + 1).join(", ")}`;
  return `${KIND_LABEL[flag.kind]} flag (${where})`;
}

async function judgeFlag(
  output: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection,
  shown: Map<string, ShownFlags>,
  uri: vscode.Uri,
  index: number,
  verdict: Verdict,
  askNote: boolean,
): Promise<void> {
  const current = shown.get(uri.toString());
  const entry = current?.entries[index];
  if (!current || !entry) return;
  const { flag } = entry;

  // A stance or fact flag can be right in some states and wrong in others:
  // ask which states the disagreement covers.
  let states: number[] | undefined;
  if (verdict === "disagree" && flag.scope === "states" && flag.findings.length > 1) {
    const picks = await vscode.window.showQuickPick(
      flag.findings.map((f) => {
        const state = f.state ?? 0;
        return {
          label: `State ${state + 1}`,
          description: current.statePaths[state] ?? "",
          detail: f.problem,
          picked: true,
          state,
        };
      }),
      {
        canPickMany: true,
        title: `Which states do you disagree with? (${KIND_LABEL[flag.kind]}, line ${flag.line})`,
        placeHolder: "Untick the states where the flag is right",
        ignoreFocusOut: true,
      },
    );
    if (!picks || picks.length === 0) return;
    states = picks.map((p) => p.state);
  }

  let note: string | undefined;
  if (askNote) {
    note = await vscode.window.showInputBox({ prompt: "Why do you disagree? (optional)", ignoreFocusOut: true });
    if (note === undefined) return;
  }

  const doc = await vscode.workspace.openTextDocument(uri);

  // A reason for rejecting a voice or stance flag is often a rule the style sheet is missing.
  if (note?.trim() && flag.speaker && flag.kind !== "fact") {
    const yes = "Add it as a rule (you can edit it)";
    const pick = await vscode.window.showQuickPick([yes, "No"], {
      title: `Add your reason to ${flag.speaker}'s style sheet?`,
      placeHolder: note.trim(),
    });
    if (pick === yes) await addRuleToStyleSheet(doc, flag.speaker, note);
  }

  // The writer decides: rejected findings go away, others stay with the verdict shown.
  const remaining = states ? flag.findings.filter((f) => !states.includes(f.state ?? 0)) : [];
  if (verdict === "disagree" && remaining.length === 0) {
    current.entries.splice(index, 1);
  } else if (verdict === "disagree") {
    const narrowed: SceneFlag = { ...flag, findings: remaining, allStates: false };
    current.entries[index] = { flag: narrowed, diagnostic: toDiagnostic(doc, narrowed) };
  } else {
    current.entries[index] = { flag, diagnostic: toDiagnostic(doc, flag, verdict) };
  }
  diagnostics.set(uri, current.entries.map((e) => e.diagnostic));
  const which = states && remaining.length > 0 ? ` for states ${states.map((s) => s + 1).join(", ")}` : "";
  output.appendLine(`Line ${flag.line} (${flag.kind}): marked ${VERDICT_LABEL[verdict]}${which}${note ? ` (${note})` : ""}`);
}

/**
 * Add a rule to the character's section of the story's style sheet, creating
 * the file or section if needed, and open it with the rule selected. The edit
 * is left unsaved: the writer rewords it and saves.
 */
async function addRuleToStyleSheet(inkDoc: vscode.TextDocument, character: string, rule: string): Promise<string | undefined> {
  const file = findStyleSheetFile(inkDoc.fileName) ?? path.join(path.dirname(inkDoc.fileName), `${path.parse(inkDoc.fileName).name}.voices.md`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, "", "utf8");

  const sheet = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
  const { text, line } = addStyleRule(sheet.getText(), character, rule);
  const edit = new vscode.WorkspaceEdit();
  edit.replace(sheet.uri, new vscode.Range(sheet.positionAt(0), sheet.positionAt(sheet.getText().length)), text);
  if (!(await vscode.workspace.applyEdit(edit))) return undefined;

  const editor = await vscode.window.showTextDocument(sheet, { viewColumn: vscode.ViewColumn.Beside, preview: false });
  const ruleLine = sheet.lineAt(line);
  editor.selection = new vscode.Selection(line, 2, line, ruleLine.text.length);
  editor.revealRange(ruleLine.range);
  vscode.window.showInformationMessage(`Rule added to ${character}'s style sheet. Reword it if you like and save; the next check uses it.`);
  return ruleLine.text.slice(2);
}

/** A style sheet's text, including unsaved edits if it is open. */
function readStyleSheet(file: string): string {
  const open = vscode.workspace.textDocuments.find((d) => path.resolve(d.fileName) === path.resolve(file));
  return open ? open.getText() : fs.readFileSync(file, "utf8");
}

function reportResult(output: vscode.OutputChannel, prepared: PreparedCheck, result: CheckResult): void {
  output.appendLine("");
  output.appendLine(
    `${result.flags.length} flags: voice pass ${result.voiceChecked ? "done" : "failed"}, ${result.statesChecked} incoming states checked`,
  );
  if (result.flags.length > 0) output.appendLine("Open the quick fixes on a flag to mark whether you agree with it.");
  prepared.grouping.groups.forEach((group, i) => {
    const values = Object.entries({ ...group.variables, ...group.visits }).map(([k, v]) => `${k}=${JSON.stringify(v)}`);
    output.appendLine(`  State ${i + 1}: ${values.join(", ")}  e.g. ${describeTrace(group.examples[0] ?? [])}`);
  });
  for (const { task, flag } of result.unplaced) {
    output.appendLine(`${taskLabel(task)}, line not found: "${flag.quote}" ${flag.problem}`);
  }
  for (const error of result.errors) output.appendLine(`Error in ${taskLabel(error.task)}: ${error.message}`);
  const u = result.usage;
  output.appendLine(
    `Tokens: ${u.inputTokens} input, ${u.cacheReadTokens} cache read, ${u.cacheWriteTokens} cache write, ${u.outputTokens} output`,
  );
}

async function setApiKey(context: vscode.ExtensionContext): Promise<void> {
  const key = await vscode.window.showInputBox({
    prompt: "Anthropic API key (stored in VS Code secret storage). Leave empty to remove it.",
    password: true,
    ignoreFocusOut: true,
  });
  if (key === undefined) return;
  if (key.trim()) await context.secrets.store(API_KEY_SECRET, key.trim());
  else await context.secrets.delete(API_KEY_SECRET);
  vscode.window.showInformationMessage(key.trim() ? "API key saved." : "API key removed.");
}

function taskLabel(task: TaskRef): string {
  return task === null ? "Voice pass" : `State ${task + 1}`;
}

function describeTrace(trace: TraceStep[]): string {
  return trace.flatMap((s) => (s.kind === "choice" ? [`[${s.text}]`] : [])).join(" > ") || "(no choices)";
}
