import * as fs from "node:fs";
import * as path from "node:path";

/** Look for `<story>.voices.md`, then `voices.md`, next to an ink file. */
export function findStyleSheetFile(inkFile: string): string | null {
  const dir = path.dirname(inkFile);
  const candidates = [path.join(dir, `${path.parse(inkFile).name}.voices.md`), path.join(dir, "voices.md")];
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}
