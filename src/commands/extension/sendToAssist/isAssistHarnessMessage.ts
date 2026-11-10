import type { HarnessCapabilities } from "../../sessions/web/ui/parseHarnessCapabilities";

export type AssistHarnessResult =
	| { ok: true; capabilities: HarnessCapabilities }
	| { ok: false; message: string };

export function isAssistHarnessMessage(message: unknown): boolean {
	return (message as { type?: unknown } | null)?.type === "assist-harness";
}
