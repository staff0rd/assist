#!/usr/bin/env node
import { isStatusLineInvocation } from "./isStatusLineInvocation";

// why: status-line is spawned on every Claude Code status update, so it skips loading the command tree
if (isStatusLineInvocation(process.argv)) {
	const { runStatusLine } = await import("./commands/runStatusLine");
	await runStatusLine();
} else {
	const { runCli } = await import("./runCli");
	await runCli();
}
