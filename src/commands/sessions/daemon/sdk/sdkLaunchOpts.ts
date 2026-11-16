import type { DrivenSessionOpts } from "../../../../shared/harnessAdapters/types";

const optional = (value: unknown) =>
	typeof value === "string" && value ? value : undefined;

const stringRecord = (value: unknown): Record<string, string> =>
	Object.fromEntries(
		Object.entries(value && typeof value === "object" ? value : {}).filter(
			(entry): entry is [string, string] => typeof entry[1] === "string",
		),
	);

export function sdkLaunchOpts(
	d: Record<string, unknown>,
	sessionId: string,
): DrivenSessionOpts {
	return {
		prompt: optional(d.prompt),
		cwd: optional(d.cwd),
		sessionId,
		conversationId: optional(d.conversationId),
		resumeId: optional(d.resumeId),
		model: optional(d.model),
		allowEdits: typeof d.allowEdits === "boolean" ? d.allowEdits : undefined,
		launcherEnv: stringRecord(d.env),
	};
}
