import type { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";

export type BrowserTool = NonNullable<
	Parameters<typeof createSdkMcpServer>[0]["tools"]
>[number];
