import { isClaudeCode } from "../../lib/isClaudeCode";
import { isCodex } from "../../lib/isCodex";
import type { HarnessKind } from "../harnesses";

export const harnessEnvironmentMarkers: Partial<
	Record<HarnessKind, () => boolean>
> = {
	claude: isClaudeCode,
	codex: isCodex,
};
