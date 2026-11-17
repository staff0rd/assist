import { spawn } from "node:child_process";
import { attachLineParser } from "../../commands/review/attachLineParser";
import { attachStderrCollector } from "../../commands/review/attachStderrCollector";
import { harnesses } from "../harnesses";
import { buildClaudeConnectorArgs } from "./buildClaudeConnectorArgs";
import { createClaudeConnectorStream } from "./createClaudeConnectorStream";
import type { ConnectorRun, ConnectorRunResult } from "./types";

const waitForClaudeAiConnectors = { MCP_CONNECTION_NONBLOCKING: "false" };

function describeExit(code: number | null, signal: string | null): string {
	return signal ? `claude was killed (${signal})` : `claude exited ${code}`;
}

export async function claudeConnectorRun(
	run: ConnectorRun,
): Promise<ConnectorRunResult> {
	const child = spawn(harnesses.claude.command, buildClaudeConnectorArgs(run), {
		stdio: ["ignore", "pipe", "pipe"],
		windowsHide: true,
		timeout: run.timeoutMs,
		env: { ...process.env, ...waitForClaudeAiConnectors },
	});
	const stream = createClaudeConnectorStream(run.onEvent, run.tools);
	const flush = attachLineParser(child, stream.onLine);
	const stderr = attachStderrCollector(child);
	const exit = await new Promise<string>((resolve, reject) => {
		child.on("error", reject);
		child.on("close", (code, signal) => resolve(describeExit(code, signal)));
	});
	flush();
	const tail = stderr.value.trim().slice(-500);
	return stream.finish(tail ? `${exit}: ${tail}` : exit);
}
