import { describe, expect, it } from "vitest";
import { claudeConversationReader as reader } from "./claudeConversationReader";

const at = "2026-11-10T00:00:00.000Z";
const user = (content: unknown, extra: Record<string, unknown> = {}) => ({
	type: "user",
	timestamp: at,
	uuid: `u-${JSON.stringify(content).length}`,
	message: { role: "user", content },
	...extra,
});
const assistant = (
	content: unknown[],
	stop_reason: string | null = "end_turn",
) => ({
	type: "assistant",
	timestamp: at,
	uuid: `a-${JSON.stringify(content).length}`,
	message: { role: "assistant", content, stop_reason },
});

describe("claudeConversationReader", () => {
	it("normalizes prompts, replies, tool calls with operations and results", () => {
		expect(
			reader.events([
				user("please fix it"),
				assistant(
					[
						{ type: "text", text: "On it." },
						{
							type: "tool_use",
							id: "t1",
							name: "Write",
							input: { file_path: "/r/a.ts", content: "x" },
						},
					],
					"tool_use",
				),
				user([{ type: "tool_result", tool_use_id: "t1", content: "ok" }]),
			]),
		).toEqual([
			{ kind: "message", role: "user", text: "please fix it", at },
			{ kind: "message", role: "assistant", text: "On it.", at },
			{
				kind: "tool",
				tool: "Write",
				target: "/r/a.ts",
				operations: [
					{
						kind: "fileWrite",
						tool: "Write",
						path: "/r/a.ts",
						contents: ["x"],
					},
				],
				at,
			},
			{ kind: "toolResult", text: "ok", at },
		]);
	});

	it("excludes replayed system content, meta, sidechain, interrupts and task notifications", () => {
		expect(
			reader.events([
				user("<system-reminder>advice</system-reminder>"),
				user("skill body", { isMeta: true }),
				user("side", { isSidechain: true }),
				user("[Request interrupted by user]"),
				user("<task-notification>done</task-notification>", {
					origin: { kind: "task-notification" },
				}),
				user([{ type: "tool_result", content: "boom", is_error: true }]),
			]),
		).toEqual([]);
	});

	it("renders a slash command prompt as typed", () => {
		expect(
			reader.events([
				user(
					"<command-name>/refine</command-name><command-args>a12</command-args>",
				),
			]),
		).toEqual([{ kind: "message", role: "user", text: "/refine a12", at }]);
	});

	it("reports a pending question as asking and a finished turn as waiting", () => {
		const asked = [
			user("go"),
			assistant(
				[{ type: "tool_use", id: "q", name: "AskUserQuestion", input: {} }],
				"tool_use",
			),
		];
		expect(reader.lifecycle(asked)).toEqual({
			status: "waiting",
			asking: true,
		});
		expect(
			reader.lifecycle([user("go"), assistant([{ type: "text", text: "ok" }])]),
		).toEqual({ status: "waiting", asking: false });
		expect(reader.lifecycle([user("go")]).status).toBe("running");
	});

	it("changes its fingerprint as the transcript grows", () => {
		const first = reader.fingerprint([user("go")]);
		expect(reader.fingerprint([user("go"), assistant([])])).not.toBe(first);
	});

	it("binds to the claude session id under the cwd's project dir", () => {
		expect(
			reader.watchTarget({ cwd: "/repo", claudeSessionId: "abc" })?.file,
		).toBe("abc.jsonl");
		expect(
			reader.watchTarget({ cwd: "/repo", harnessSessionId: "x" }),
		).toBeNull();
	});
});
