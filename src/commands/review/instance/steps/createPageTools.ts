import { tool } from "@anthropic-ai/claude-agent-sdk";
import type { Page } from "playwright";
import { z } from "zod";
import type { BrowserTool } from "./BrowserTool";
import { describePage } from "./describePage";
import { toolResult } from "./toolResult";

export function createPageTools(page: Page, baseUrl: string): BrowserTool[] {
	return [
		tool(
			"navigate",
			"Open a URL; a path is resolved against the instance URL",
			{ url: z.string() },
			({ url }) =>
				toolResult(async () => {
					await page.goto(new URL(url, baseUrl).toString());
					return describePage(page);
				}),
		),
		tool(
			"snapshot",
			"The current URL, title and accessibility tree of the page",
			{},
			() => toolResult(() => describePage(page)),
		),
		tool("screenshot", "A screenshot of the visible page", {}, () =>
			toolResult(async () => ({
				content: [
					{
						type: "image",
						data: (await page.screenshot()).toString("base64"),
						mimeType: "image/png",
					},
				],
			})),
		),
	] as BrowserTool[];
}
