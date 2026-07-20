import fs from "node:fs";
import { readStdin } from "../../lib/readStdin";
import { decideCommentGuard } from "./decideCommentGuard";
import { decideMigrationGuard } from "./decideMigrationGuard";
import { decideOverrideGuard, type EditHookInput } from "./decideOverrideGuard";

function tryParseInput(raw: string): EditHookInput | undefined {
	try {
		const data: EditHookInput = JSON.parse(raw);
		if (typeof data.tool_name !== "string" || !data.tool_input)
			return undefined;
		return data;
	} catch {
		return undefined;
	}
}

function readExisting(filePath: string | undefined): string | undefined {
	if (!filePath) return undefined;
	try {
		return fs.readFileSync(filePath, "utf8");
	} catch {
		return undefined;
	}
}

export async function editHook(): Promise<void> {
	const input = tryParseInput(await readStdin());
	if (!input) return;

	const existing =
		input.tool_name === "Write"
			? readExisting(input.tool_input.file_path)
			: undefined;

	const reason =
		decideOverrideGuard(input, existing) ??
		decideCommentGuard(input, existing) ??
		decideMigrationGuard(input, existing);
	if (!reason) return;

	console.log(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision: "deny",
				permissionDecisionReason: reason,
			},
		}),
	);
}
