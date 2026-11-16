import { query } from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../../daemonLog";
import { resolveClaudeExecutable } from "../../resolveClaudeExecutable";
import type { DrivenSessionDriver } from "../DrivenSessionDriver";
import { awaitResume } from "./awaitResume";
import { claudeTurnEvents } from "./claudeTurnEvents";
import { claudeUserMessages } from "./claudeUserMessages";
import { sdkQueryOptions } from "./sdkQueryOptions";

export const claudeSdkDriver: DrivenSessionDriver = {
	harness: "claude-sdk",
	start: (context) => {
		const { opts, label, control, input } = context;
		const executable = resolveClaudeExecutable();
		daemonLog(
			`${label} sdk query starting: claude ${executable}, claude session ${opts.conversationId ?? "unassigned"}, permission mode auto, cwd ${opts.cwd ?? process.cwd()}`,
		);
		const messages = query({
			prompt: claudeUserMessages(input),
			options: sdkQueryOptions(context, executable),
		});
		if (opts.resumeId) awaitResume(label, messages, control);
		return {
			events: claudeTurnEvents(messages, label),
			interrupt: async () => {
				await messages.interrupt();
			},
			stopTask: (taskId) => messages.stopTask(taskId),
		};
	},
};
