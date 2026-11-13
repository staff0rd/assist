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
	const resolved = resolveHarness(kind);
	if (resolved === "claude" && process.env.ASSIST_SDK_SESSION === "1")
		return claudeSdkAdapter;
	return adapters[resolved];
}
