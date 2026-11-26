import { createSdkMcpServer, query } from "@anthropic-ai/claude-agent-sdk";
import type { BrowserTool } from "./BrowserTool";
import { describeToolUse } from "./describeToolUse";

type StepAgentInput = {
	prompt: string;
	tools: BrowserTool[];
	cwd: string;
	executable: string;
	abort: AbortController;
};

const SERVER = "browser";

export async function runStepAgent(input: StepAgentInput): Promise<void> {
	const server = createSdkMcpServer({ name: SERVER, tools: input.tools });
	const messages = query({
		prompt: input.prompt,
		options: {
			cwd: input.cwd,
			tools: [],
			mcpServers: { [SERVER]: server },
			allowedTools: input.tools.map((t) => `mcp__${SERVER}__${t.name}`),
			permissionMode: "dontAsk",
			settingSources: [],
			maxTurns: 40,
			pathToClaudeCodeExecutable: input.executable,
			abortController: input.abort,
		},
	});
	for await (const message of messages) {
		if (message.type !== "assistant") continue;
		for (const block of message.message.content)
			if (block.type === "tool_use")
				console.log(`    ${describeToolUse(block.name, block.input)}`);
	}
}
