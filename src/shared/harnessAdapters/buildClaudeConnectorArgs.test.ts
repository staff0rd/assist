import { z } from "zod";
import { describe, expect, it } from "vitest";
import { inboxScanSchema } from "../../commands/inbox/inboxScanSchema";
import { buildClaudeConnectorArgs } from "./buildClaudeConnectorArgs";

describe("buildClaudeConnectorArgs", () => {
	const args = buildClaudeConnectorArgs({
		prompt: "triage",
		schema: z.toJSONSchema(inboxScanSchema, { target: "draft-07" }),
		tools: [
			"gmail.searchThreads",
			"gmail.getThread",
			"slack.search",
			"slack.readThread",
		],
	});
	const listAfter = (flag: string) => {
		const start = args.indexOf(flag) + 1;
		const end = args.findIndex((a, i) => i >= start && a.startsWith("--"));
		return args.slice(start, end);
	};

	it("allows only the requested connector tools by their claude.ai names", () => {
		expect(listAfter("--allowedTools")).toEqual([
			"mcp__claude_ai_Gmail__search_threads",
			"mcp__claude_ai_Gmail__get_thread",
			"mcp__claude_ai_Slack__slack_search_public_and_private",
			"mcp__claude_ai_Slack__slack_read_thread",
		]);
		expect(
			buildClaudeConnectorArgs({
				prompt: "p",
				schema: {},
				tools: ["gmail.getThread"],
			}),
		).not.toContain("mcp__claude_ai_Gmail__search_threads");
	});

	it("disables built-in tools and denies anything not pre-approved", () => {
		expect(
			args.slice(args.indexOf("--tools"), args.indexOf("--tools") + 2),
		).toEqual(["--tools", ""]);
		expect(args[args.indexOf("--permission-mode") + 1]).toBe("dontAsk");
		expect(listAfter("--disallowedTools")).toContain(
			"mcp__claude_ai_Gmail__update_message_labels",
		);
	});

	it("streams events so the scan can be followed live", () => {
		expect(args[args.indexOf("--output-format") + 1]).toBe("stream-json");
		expect(args).toContain("--verbose");
	});

	it("passes the draft-07 schema, the newest draft claude -p validates", () => {
		const schema = JSON.parse(args[args.indexOf("--json-schema") + 1]);
		expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
		expect(args.slice(-2)).toEqual(["--", "triage"]);
	});
});
