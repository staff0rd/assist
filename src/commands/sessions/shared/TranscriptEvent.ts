export type ToolUse = { id: string; name: string };

export type TranscriptEvent =
	| { kind: "assistant"; stopReason: string | null; toolUses: ToolUse[] }
	| { kind: "user" }
	| { kind: "interrupt" }
	| { kind: "toolResult"; ids: string[] };
