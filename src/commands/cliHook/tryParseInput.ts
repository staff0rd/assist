import type { NativeToolCall } from "../../shared/harnessAdapters/types";

type HookInput = {
	session_id?: unknown;
	tool_name?: unknown;
	tool_input?: Record<string, unknown>;
};

export function tryParseInput(
	raw: string,
): (NativeToolCall & { sessionId?: string }) | undefined {
	try {
		const data: HookInput = JSON.parse(raw);
		if (typeof data.tool_name !== "string") return undefined;
		return {
			toolName: data.tool_name,
			toolInput: data.tool_input ?? {},
			...(typeof data.session_id === "string" && {
				sessionId: data.session_id,
			}),
		};
	} catch {
		return undefined;
	}
}
