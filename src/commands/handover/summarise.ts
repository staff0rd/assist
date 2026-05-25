import { execFileSync } from "node:child_process";
import { iterateUserEntries } from "../sessions/summarise/iterateUserEntries";

export const SUMMARISE_RECURSION_GUARD = "_CLAUDE_HOOK_SUMMARISE_RUNNING";
const MAX_TURNS = 15;
const MAX_PAYLOAD_BYTES = 8 * 1024;
const PROMPT_TEMPLATE = [
	"Summarise what the user has been working on in this Claude Code session in ONE short sentence (under 100 chars).",
	"Return ONLY the summary, no quotes, prefix, or explanation.",
	"",
	"Last user turns (most recent last):",
].join("\n");

export function summarise(jsonlPath: string): string {
	const entries = [...iterateUserEntries(jsonlPath)];

	const humanEntries = entries.filter((e) => e.entrypoint !== "sdk-cli");
	if (humanEntries.length === 0) return "";

	const turns = humanEntries
		.map((e) => stripPreludes(e.text))
		.filter((t) => t.length > 0)
		.slice(-MAX_TURNS);

	if (turns.length === 0) return "";

	const payload = capPayload(turns.join("\n---\n"), MAX_PAYLOAD_BYTES);
	const prompt = `${PROMPT_TEMPLATE}\n${payload}`;

	try {
		const output = execFileSync("claude", ["-p", "--model", "haiku", prompt], {
			encoding: "utf8",
			timeout: 30_000,
			stdio: ["ignore", "pipe", "ignore"],
			env: { ...process.env, [SUMMARISE_RECURSION_GUARD]: "1" },
		});
		return normaliseOutput(output);
	} catch {
		return "";
	}
}

export function stripPreludes(text: string): string {
	return text
		.replace(/<command-name>[\s\S]*?<\/command-name>/g, "")
		.replace(/<command-message>[\s\S]*?<\/command-message>/g, "")
		.replace(/<command-args>[\s\S]*?<\/command-args>/g, "")
		.replace(/<local-command-stdout>[\s\S]*?<\/local-command-stdout>/g, "")
		.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
		.trim();
}

function capPayload(text: string, maxBytes: number): string {
	const buf = Buffer.from(text, "utf8");
	if (buf.length <= maxBytes) return text;
	return buf.subarray(buf.length - maxBytes).toString("utf8");
}

function normaliseOutput(raw: string): string {
	const firstLine = raw.trim().split("\n")[0] ?? "";
	return firstLine.replace(/^["']|["']$/g, "").trim();
}
