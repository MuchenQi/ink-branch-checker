import { readFileSync } from "node:fs";
import { join } from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import {
  checkScene,
  createClaudeReviewer,
  parseReview,
  prepareCheck,
  REVIEW_SCHEMA,
  SYSTEM_PROMPT,
  STATE_TASK_TEXT,
  VOICE_TASK,
  type RawFlag,
  type Reviewer,
  type ReviewTask,
  type ScenePrompt,
  type TaskRef,
} from "../src";

const example = (file: string) => readFileSync(join(__dirname, "../../../examples", file), "utf8");
const betrayal = example("betrayal.ink");
const styleSheet = example("betrayal.voices.md");
const prepare = (opts = {}) => prepareCheck(betrayal, "campfire", { fileName: "betrayal.ink", styleSheet, ...opts });

const flag = (overrides: Partial<RawFlag> = {}): RawFlag => ({
  line: 62,
  kind: "voice",
  severity: "medium",
  speaker: "Mara",
  quote: "Don't sit so close.",
  problem: "Too warm.",
  evidence: "Rule: cold after betrayal.",
  ...overrides,
});

describe("scene prompt", () => {
  const prepared = prepare();
  const sourceLines = betrayal.split(/\r?\n/);

  it("shows only the scene, numbered by source line", () => {
    const { lines, text } = prepared.scenePrompt;
    expect(lines[0].text).toBe("=== campfire ===");
    for (const l of lines) expect(sourceLines[l.line - 1]).toBe(l.text);
    expect(text).toContain(`62 |     Mara: Don't sit so close.`);
    expect(text).not.toContain("=== market ===");
  });

  it("includes Mara's rules, examples, and samples from other scenes only", () => {
    const { text } = prepared.scenePrompt;
    expect(text).toContain(`<voice character="Mara">`);
    expect(text).toContain("Never apologises, and mocks other people's apologies.");
    expect(text).toContain("[escape] Sorry doesn't unlock cuffs.");
    expect(text).not.toMatch(/\[campfire\]/);
    expect(text).toContain("Everyone in this story speaks plainly.");
  });

  it("is byte-identical across runs so it caches", () => {
    expect(prepare().scenePrompt.text).toBe(prepared.scenePrompt.text);
    expect(prepare().statePrompts.map((s) => s.text)).toEqual(prepared.statePrompts.map((s) => s.text));
  });
});

describe("state prompts", () => {
  it("has one prompt per state group, with starred defining variables", () => {
    const prepared = prepare();
    expect(prepared.statePrompts).toHaveLength(prepared.grouping.groups.length);
    const first = prepared.statePrompts[0].text;
    expect(first).toMatch(/^\* betrayed_mara = (true|false)$/m);
    expect(first).toMatch(/^\* mara_trust = /m);
    expect(first).toContain("> player chooses:");
  });

  it("shows values that differ inside a merged group", () => {
    // With no speaker named Mara, mara_trust no longer splits the two betrayal paths.
    const plain = prepareCheck(betrayal.replace(/Mara:/g, "Someone:"), "campfire", { keepAllUpTo: 0 });
    const merged = plain.statePrompts.find((s) => s.text.includes("betrayed_mara = true"))!;
    expect(merged.text).toMatch(/^ {2}mara_trust = varies by path: (3 \| 1|1 \| 3)$/m);
  });

  it("keeps only the most recent steps of long paths", () => {
    const prepared = prepare({ prompt: { maxStepsPerPath: 3, maxPaths: 1 } });
    const text = prepared.statePrompts[0].text;
    expect(text).toMatch(/Path 1 \(last 3 steps\):/);
    expect(text).not.toContain("Path 2");
  });
});

describe("checkScene", () => {
  const prepared = prepare();
  const scene = prepared.scenePrompt;
  const states = prepared.statePrompts.slice(0, 3);
  const usage = { inputTokens: 100, outputTokens: 10, cacheReadTokens: 50, cacheWriteTokens: 5 };

  /** A fake reviewer. `task` is null for the voice pass, else the state index. */
  const fake = (byTask: (task: TaskRef) => RawFlag[] | Error): Reviewer & { calls: TaskRef[] } => {
    const calls: TaskRef[] = [];
    return {
      calls,
      async review(_scene: ScenePrompt, task: ReviewTask) {
        const ref = task.type === "voice" ? null : task.index;
        calls.push(ref);
        const result = byTask(ref);
        if (result instanceof Error) throw result;
        return { flags: result, usage };
      },
    };
  };

  it("runs one voice pass for the scene and one stance-and-fact pass per state", async () => {
    const reviewer = fake(() => []);
    const result = await checkScene(scene, states, reviewer);
    expect(reviewer.calls).toEqual([null, 0, 1, 2]);
    expect(result.voiceChecked).toBe(true);
    expect(result.statesChecked).toBe(3);
    expect(result.usage).toEqual({ inputTokens: 400, outputTokens: 40, cacheReadTokens: 200, cacheWriteTokens: 20 });
  });

  it("shows voice flags once for the whole scene", async () => {
    const reviewer = fake((task) => (task === null ? [flag({ kind: "voice", severity: "high" })] : []));
    const [voice] = (await checkScene(scene, states, reviewer)).flags;
    expect(voice).toMatchObject({ line: 62, kind: "voice", scope: "scene", severity: "high", allStates: true });
    expect(voice.findings.map((f) => f.state)).toEqual([null]);
  });

  it("merges stance and fact flags across states and marks lines flagged everywhere", async () => {
    const reviewer = fake((task) =>
      task === null
        ? []
        : [
            flag({ kind: "stance", severity: task === 1 ? "high" : "low" }),
            ...(task === 2 ? [flag({ line: 70, kind: "fact", quote: "map" })] : []),
          ],
    );
    const [stance, fact] = (await checkScene(scene, states, reviewer)).flags;
    expect(stance).toMatchObject({ line: 62, kind: "stance", scope: "states", severity: "high", allStates: true });
    expect(stance.findings.map((f) => f.state)).toEqual([0, 1, 2]);
    expect(fact).toMatchObject({ line: 70, kind: "fact", allStates: false });
    expect(fact.findings.map((f) => f.state)).toEqual([2]);
  });

  it("ignores flags of kinds the task did not ask for", async () => {
    const reviewer = fake((task) => (task === null ? [flag({ kind: "fact" })] : [flag({ kind: "voice" })]));
    const result = await checkScene(scene, states, reviewer);
    expect(result.flags).toEqual([]);
    expect(result.ignored.map((i) => i.task)).toEqual([null, 0, 1, 2]);
  });

  it("runs the voice pass alone before the states, to fill the cache", async () => {
    let inFlight = 0;
    let firstRanAlone = false;
    const reviewer: Reviewer = {
      async review(_s, task) {
        inFlight++;
        if (task.type === "voice") firstRanAlone = inFlight === 1;
        await new Promise((r) => setTimeout(r, 5));
        inFlight--;
        return { flags: [] };
      },
    };
    await checkScene(scene, prepared.statePrompts, reviewer, { concurrency: 4 });
    expect(firstRanAlone).toBe(true);
  });

  it("can skip the voice pass", async () => {
    const reviewer = fake(() => []);
    const result = await checkScene(scene, states, reviewer, { voice: false });
    expect(reviewer.calls).toEqual([0, 1, 2]);
    expect(result.voiceChecked).toBe(false);
  });

  it("relocates flags by quote and keeps flags it cannot place", async () => {
    const reviewer = fake((task) =>
      task === null ? [flag({ line: 999, quote: "You unfold the map" }), flag({ line: 3, quote: "not in scene" })] : [],
    );
    const result = await checkScene(scene, states.slice(0, 1), reviewer);
    expect(result.flags.map((f) => f.line)).toEqual([70]);
    expect(result.unplaced).toHaveLength(1);
  });

  it("records failed requests and judges allStates against the states that succeeded", async () => {
    const reviewer = fake((task) => (task === 1 ? new Error("boom") : task === null ? [] : [flag({ kind: "fact" })]));
    const result = await checkScene(scene, states, reviewer);
    expect(result.errors).toEqual([{ task: 1, run: 0, message: "boom" }]);
    expect(result.statesChecked).toBe(2);
    expect(result.flags[0].allStates).toBe(true);
  });

  it("counts how often each flag recurs across repeated runs", async () => {
    let call = 0;
    const reviewer: Reviewer = {
      async review(_scene, task) {
        const n = call++;
        if (task.type === "voice") return { flags: [flag({ kind: "voice" })] };
        // Stance on state 0 every run; a stray fact on state 1 in the first run only.
        const flags = task.index === 0 ? [flag({ kind: "stance" })] : [];
        if (task.index === 1 && n < 4) flags.push(flag({ kind: "fact", line: 70, quote: "map" }));
        return { flags };
      },
    };
    const result = await checkScene(scene, states, reviewer, { repeat: 3, concurrency: 1 });
    expect(result.runs).toBe(3);
    const byKey = Object.fromEntries(result.flags.map((f) => [`${f.line} ${f.kind}`, f]));
    expect(byKey["62 voice"]).toMatchObject({ seenIn: 3, runs: 3, allStates: true });
    expect(byKey["62 stance"]).toMatchObject({ seenIn: 3, allStates: false });
    expect(byKey["62 stance"].findings).toEqual([expect.objectContaining({ state: 0, seenIn: 3 })]);
    expect(byKey["70 fact"]).toMatchObject({ seenIn: 1 });
    expect(byKey["70 fact"].findings).toEqual([expect.objectContaining({ state: 1, seenIn: 1 })]);
  });

  it("calls allStates only when every state raised the flag in most runs", async () => {
    let stateCalls = 0;
    const reviewer: Reviewer = {
      async review(_scene, task) {
        if (task.type === "voice") return { flags: [] };
        // Every state flags it, except state 2 in all but one run.
        const flagged = task.index !== 2 || stateCalls++ === 0;
        return { flags: flagged ? [flag({ kind: "fact" })] : [] };
      },
    };
    const result = await checkScene(scene, states, reviewer, { repeat: 3, concurrency: 1 });
    const [fact] = result.flags;
    expect(fact.findings.map((f) => [f.state, f.seenIn])).toEqual([[0, 3], [1, 3], [2, 1]]);
    expect(fact.allStates).toBe(false);
  });

  it("counts a line once per run even if a response repeats it", async () => {
    const reviewer = fake((task) => (task === 0 ? [flag({ kind: "fact" }), flag({ kind: "fact", problem: "again" })] : []));
    const result = await checkScene(scene, states.slice(0, 1), reviewer, { repeat: 2 });
    expect(result.flags[0].findings).toEqual([expect.objectContaining({ state: 0, seenIn: 2 })]);
  });

  it("reports a failed voice pass", async () => {
    const reviewer = fake((task) => (task === null ? new Error("no voice") : []));
    const result = await checkScene(scene, states, reviewer);
    expect(result.voiceChecked).toBe(false);
    expect(result.errors).toEqual([{ task: null, run: 0, message: "no voice" }]);
  });
});

describe("parseReview", () => {
  it("accepts valid flags and rejects bad ones", () => {
    expect(parseReview({ flags: [flag()] })).toEqual([flag()]);
    expect(parseReview({ flags: [] })).toEqual([]);
    expect(() => parseReview({})).toThrow(/flags/);
    expect(() => parseReview({ flags: [{ ...flag(), kind: "tone" }] })).toThrow(/schema/);
  });
});

describe("createClaudeReviewer", () => {
  const prepared = prepare();

  function fakeClient(response: object) {
    const requests: any[] = [];
    const client = {
      beta: {
        messages: {
          create: async (params: any) => {
            requests.push(params);
            return response;
          },
        },
      },
    } as unknown as Anthropic;
    return { client, requests };
  }

  const ok = {
    stop_reason: "end_turn",
    stop_details: null,
    content: [{ type: "text", text: JSON.stringify({ flags: [flag()] }) }],
    usage: { input_tokens: 40, output_tokens: 20, cache_read_input_tokens: 700, cache_creation_input_tokens: 0 },
  };

  it("sends a cache-friendly request with structured output and fallbacks", async () => {
    const { client, requests } = fakeClient(ok);
    const result = await createClaudeReviewer({ client }).review(prepared.scenePrompt, prepared.statePrompts[0]);
    expect(result.flags).toEqual([flag()]);
    expect(result.usage).toEqual({ inputTokens: 40, outputTokens: 20, cacheReadTokens: 700, cacheWriteTokens: 0 });

    const [req] = requests;
    expect(req.model).toBe("claude-sonnet-5-5");
    expect(req.fallbacks).toBe("default");
    expect(req.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(req.output_config).toEqual({ effort: "high", format: { type: "json_schema", schema: REVIEW_SCHEMA } });
    expect(req.system).toEqual([{ type: "text", text: SYSTEM_PROMPT }]);
    const [sceneBlock, stateBlock] = req.messages[0].content;
    expect(sceneBlock).toEqual({ type: "text", text: prepared.scenePrompt.text, cache_control: { type: "ephemeral" } });
    expect(stateBlock).toEqual({ type: "text", text: prepared.statePrompts[0].text });
  });

  it("passes model and effort through", async () => {
    const { client, requests } = fakeClient(ok);
    await createClaudeReviewer({ client, model: "claude-haiku-5-5", effort: "low" }).review(
      prepared.scenePrompt,
      prepared.statePrompts[0],
    );
    expect(requests[0].model).toBe("claude-haiku-5-5");
    expect(requests[0].output_config.effort).toBe("low");
  });

  it("turns refusals, truncation, and bad JSON into errors", async () => {
    const run = (response: object) =>
      createClaudeReviewer({ client: fakeClient(response).client }).review(prepared.scenePrompt, prepared.statePrompts[0]);
    await expect(run({ ...ok, stop_reason: "refusal", stop_details: { category: "general_harms" } })).rejects.toThrow(/declined.*general_harms/);
    await expect(run({ ...ok, stop_reason: "max_tokens" })).rejects.toThrow(/max_tokens/);
    await expect(run({ ...ok, content: [{ type: "text", text: "nope" }] })).rejects.toThrow(/not valid JSON/);
  });
});

describe("scope and persona", () => {
  it("asks for voice, stance, and fact only, and rules out motivation and plot", () => {
    expect(REVIEW_SCHEMA.properties.flags.items.properties.kind.enum).toEqual(["voice", "stance", "fact"]);
    expect(SYSTEM_PROMPT).toMatch(/Do not flag a character's motivations, decisions, or behaviour, plot logic/);
    expect(SYSTEM_PROMPT).toMatch(/style sheet is declared by the writer and is the authority/);
    expect(parseReview({ flags: [flag({ kind: "stance" })] })[0].kind).toBe("stance");
  });

  it("says when a speaker has no declared style sheet", () => {
    const withSheet = prepare().scenePrompt.text;
    const without = prepareCheck(betrayal, "campfire").scenePrompt.text;
    expect(withSheet).not.toContain("has not declared a style sheet");
    expect(without).toContain("The writer has not declared a style sheet for this character.");
    expect(without).toContain("for reference");
  });
});

describe("voice and state tasks", () => {
  const prepared = prepare();

  it("puts the task after the cached scene block, so both kinds of request share one cache entry", async () => {
    const requests: any[] = [];
    const client = {
      beta: {
        messages: {
          create: async (params: any) => {
            requests.push(params);
            return {
              stop_reason: "end_turn",
              stop_details: null,
              content: [{ type: "text", text: JSON.stringify({ flags: [] }) }],
              usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
            };
          },
        },
      },
    } as unknown as Anthropic;
    const reviewer = createClaudeReviewer({ client });
    await reviewer.review(prepared.scenePrompt, VOICE_TASK);
    await reviewer.review(prepared.scenePrompt, prepared.statePrompts[0]);

    const [voice, state] = requests;
    expect(voice.system).toEqual(state.system);
    expect(voice.messages[0].content[0]).toEqual(state.messages[0].content[0]);
    expect(voice.messages[0].content[1].text).toContain('<task type="voice">');
    expect(state.messages[0].content[1].text.startsWith(STATE_TASK_TEXT)).toBe(true);
  });
});
