import { compileInk, type CompiledStory } from "./compile";
import { findDependencies } from "./dependencies";
import { extractDialogue } from "./dialogue";
import { enumerateStates, type EnumerateOptions, type EnumerationResult } from "./enumerate";
import { groupArrivals, type Grouping } from "./group";
import { buildScenePrompt, buildStatePrompts, type PromptOptions, type ScenePrompt, type StatePrompt } from "./prompt";
import { variableNotes } from "./source";
import { parseStyleSheets, type StyleSheets } from "./stylesheet";
import { buildVoiceProfiles, declaredCharactersIn, speakersIn, type VoiceProfile } from "./voice";
import { checkScene, type CheckOptions, type CheckResult, type Reviewer } from "./checker";

export interface PrepareOptions {
  fileName?: string;
  /** Markdown style sheet text, if any. */
  styleSheet?: string;
  /** Extra variables or knots to distinguish states by. */
  pin?: string[];
  /** Keep every distinct variable state up to this many before merging. See GroupOptions. */
  keepAllUpTo?: number;
  enumerate?: Omit<EnumerateOptions, "target">;
  prompt?: PromptOptions;
  maxSamples?: number;
}

/** Everything needed to check a scene, computed without calling a model. */
export interface PreparedCheck {
  scene: string;
  compiled: CompiledStory;
  enumeration: EnumerationResult;
  grouping: Grouping;
  speakers: string[];
  profiles: VoiceProfile[];
  styleSheets?: StyleSheets;
  scenePrompt: ScenePrompt;
  statePrompts: StatePrompt[];
}

export function prepareCheck(source: string, scene: string, options: PrepareOptions = {}): PreparedCheck {
  const file = options.fileName ?? "main.ink";
  const compiled = compileInk(source, { fileName: file });
  const enumeration = enumerateStates(compiled, { ...options.enumerate, target: scene });

  const dialogue = extractDialogue(source, { file });
  const styleSheets = options.styleSheet ? parseStyleSheets(options.styleSheet) : undefined;
  // Who speaks in the scene, plus declared characters it mentions but who have not spoken yet.
  const speakers = speakersIn(dialogue, scene);
  for (const name of declaredCharactersIn(source, scene, styleSheets)) {
    if (!speakers.some((s) => s.toLowerCase() === name.toLowerCase())) speakers.push(name);
  }
  const profiles = buildVoiceProfiles(dialogue, {
    styleSheets,
    exclude: scene,
    characters: speakers,
    maxSamples: options.maxSamples,
  });

  const grouping = groupArrivals(compiled, enumeration, {
    dependencies: findDependencies(compiled, scene),
    characters: speakers,
    pin: options.pin,
    keepAllUpTo: options.keepAllUpTo,
  });

  return {
    scene,
    compiled,
    enumeration,
    grouping,
    speakers,
    profiles,
    styleSheets,
    scenePrompt: buildScenePrompt(source, scene, profiles, { file, styleSheets, variableNotes: variableNotes(source) }),
    statePrompts: buildStatePrompts(compiled, grouping, options.prompt),
  };
}

export function runCheck(prepared: PreparedCheck, reviewer: Reviewer, options?: CheckOptions): Promise<CheckResult> {
  return checkScene(prepared.scenePrompt, prepared.statePrompts, reviewer, options);
}
