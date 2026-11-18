import Anthropic from "@anthropic-ai/sdk";
import { parseReview, type Reviewer, type ReviewResponse } from "./checker";
import { REVIEW_SCHEMA, SYSTEM_PROMPT, type ReviewTask, type ScenePrompt } from "./prompt";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface ClaudeReviewerOptions {
  /** Defaults to a client that reads ANTHROPIC_API_KEY or an `ant auth login` profile. */
  client?: Anthropic;
  apiKey?: string;
  /** Default "claude-sonnet-5-5". */
  model?: string;
  /** Default "high". */
  effort?: Effort;
  /** Default 16000. */
  maxTokens?: number;
}

export const DEFAULT_MODEL = "claude-sonnet-5-5";
export const DEFAULT_EFFORT: Effort = "high";

export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewError";
  }
}

/**
 * Review with Claude. Prompt layout, from most to least stable: system
 * instructions, then the scene and voices (cached, shared by every request of
 * one check), then the task: the voice pass or one incoming state.
 */
export function createClaudeReviewer(options: ClaudeReviewerOptions = {}): Reviewer {
  const client = options.client ?? new Anthropic(options.apiKey ? { apiKey: options.apiKey } : {});
  const model = options.model ?? DEFAULT_MODEL;
  const effort = options.effort ?? DEFAULT_EFFORT;
  const maxTokens = options.maxTokens ?? 16000;

  return {
    async review(scene: ScenePrompt, task: ReviewTask): Promise<ReviewResponse> {
      const label = task.type === "voice" ? "the voice pass" : `state ${task.index + 1}`;
      const response = await client.beta.messages.create({
        model,
        max_tokens: maxTokens,
        // On a policy decline, retry server-side on Anthropic's recommended fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        thinking: { type: "adaptive" },
        output_config: { effort, format: { type: "json_schema", schema: REVIEW_SCHEMA } },
        system: [{ type: "text", text: SYSTEM_PROMPT }],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: scene.text, cache_control: { type: "ephemeral" } },
              { type: "text", text: task.text },
            ],
          },
        ],
      });

      if (response.stop_reason === "refusal") {
        const category = response.stop_details?.category ?? "unspecified";
        throw new ReviewError(`Claude declined to review ${label} (${category})`);
      }
      if (response.stop_reason === "max_tokens") {
        throw new ReviewError(`Review of ${label} hit max_tokens before finishing`);
      }

      const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new ReviewError(`Review of ${label} was not valid JSON`);
      }

      return {
        flags: parseReview(parsed),
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
          cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
        },
      };
    },
  };
}
