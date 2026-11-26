import { tool } from "@anthropic-ai/claude-agent-sdk";
import type { Page } from "playwright";
import { z } from "zod";
import type { BrowserTool } from "./BrowserTool";
import { describePage } from "./describePage";
import { toolResult } from "./toolResult";

const ACTION_TIMEOUT = 10_000;

const selector = z
	.string()
	.describe(
		'A Playwright selector, e.g. role=button[name="Save"], text=Sign in, label=Email or a CSS selector',
	);

export function createInputTools(page: Page): BrowserTool[] {
	const first = (target: string) => page.locator(target).first();
	return [
		tool(
			"click",
			"Click the first element matching a selector",
			{ selector },
			(args) =>
				toolResult(async () => {
					await first(args.selector).click({ timeout: ACTION_TIMEOUT });
					return describePage(page);
				}),
		),
		tool(
			"fill",
			"Replace the value of the first input matching a selector",
			{ selector, value: z.string() },
			(args) =>
				toolResult(async () => {
					await first(args.selector).fill(args.value, {
						timeout: ACTION_TIMEOUT,
					});
					return `Filled ${args.selector}`;
				}),
		),
		tool(
			"press",
			"Press a key (e.g. Enter, Tab, Escape) on the focused element",
			{ key: z.string() },
			({ key }) =>
				toolResult(async () => {
					await page.keyboard.press(key);
					return describePage(page);
				}),
		),
		tool(
			"wait",
			"Wait up to 10 seconds for something to change",
			{ ms: z.number().int().min(0).max(ACTION_TIMEOUT) },
			({ ms }) =>
				toolResult(async () => {
					await page.waitForTimeout(ms);
					return describePage(page);
				}),
		),
	] as BrowserTool[];
}
