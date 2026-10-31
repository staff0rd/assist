import { spawn } from "node:child_process";
import { z } from "zod";
import { attachLineParser } from "../review/attachLineParser";
import { attachStderrCollector } from "../review/attachStderrCollector";
import { buildInboxScanPrompt } from "./buildInboxScanPrompt";
import { createInboxScanParser } from "./createInboxScanParser";
import type { InboxScanEvent } from "./InboxScanEvent";
import { type FlaggedMessage, inboxScanSchema } from "./inboxScanSchema";
import { inboxScanTools } from "./inboxScanTools";

export function buildInboxScanArgs(since: Date): string[] {
	return [
		"-p",
		"--tools",
		"",
		"--permission-mode",
		"dontAsk",
		"--allowedTools",
		...inboxScanTools.allowed,
		"--disallowedTools",
		...inboxScanTools.denied,
		"--no-session-persistence",
		"--output-format",
		"stream-json",
		"--verbose",
		"--json-schema",
		JSON.stringify(z.toJSONSchema(inboxScanSchema, { target: "draft-07" })),
		"--",
		buildInboxScanPrompt(since),
	];
}

function describeExit(code: number | null, signal: string | null): string {
	return signal ? `claude was killed (${signal})` : `claude exited ${code}`;
}

export async function runInboxScanClaude(
	since: Date,
	onEvent: (event: InboxScanEvent) => void = () => {},
): Promise<FlaggedMessage[]> {
	const child = spawn("claude", buildInboxScanArgs(since), {
		stdio: ["ignore", "pipe", "pipe"],
		windowsHide: true,
		timeout: 20 * 60_000,
	});
	const parser = createInboxScanParser(onEvent);
	const flush = attachLineParser(child, parser.onLine);
	const stderr = attachStderrCollector(child);
	const exit = await new Promise<string>((resolve, reject) => {
		child.on("error", reject);
		child.on("close", (code, signal) => resolve(describeExit(code, signal)));
	});
	flush();
	const tail = stderr.value.trim().slice(-500);
	return parser.finish(tail ? `${exit}: ${tail}` : exit);
}
