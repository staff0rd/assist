import type { HarnessKind } from "../harnesses";
import { resolveHarness } from "./harnessLabel";
import { claudeAdapter } from "./claudeAdapter";
import { claudeSdkAdapter } from "./claudeSdkAdapter";
import { codexAdapter } from "./codexAdapter";
import { piAdapter } from "./piAdapter";
import type { HarnessAdapter } from "./types";

const adapters: Record<HarnessKind, HarnessAdapter> = {
	claude: claudeAdapter,
	"claude-sdk": claudeSdkAdapter,
	codex: codexAdapter,
	pi: piAdapter,
};

export function harnessAdapter(kind: HarnessKind | undefined): HarnessAdapter {
	return adapters[resolveHarness(kind)];
}
