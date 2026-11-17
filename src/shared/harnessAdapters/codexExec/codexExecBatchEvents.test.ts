import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { codexConversationReader as reader } from "../codexConversationReader";
import type { ConversationEvent } from "../types";

const rollout = readFileSync(
	new URL("../fixtures/codexExecBatches.jsonl", import.meta.url),
	"utf8",
)
	.split("\n")
	.filter(Boolean)
	.map((line) => JSON.parse(line));

type ToolEvent = Extract<ConversationEvent, { kind: "tool" }>;

const inputOf = (id: string): string =>
	rollout.find((row) => row.payload.id === `ctc_${id}`).payload.input;
const field = (event: ToolEvent, name: string) =>
	event.fields?.find((f) => f.name === name)?.value;

describe("codex exec batch events", () => {
	const events = reader.events(rollout);
	const tools = events.filter((e): e is ToolEvent => e.kind === "tool");

	it("gives each recognised call its own row in source order, with no parent wrapper row", () => {
		expect(tools.map((e) => [e.tool, e.label])).toEqual([
			["exec_command", "sed -n '90,155p' packages/web/src/CreditsChart.tsx"],
			["exec_command", "sed -n '1,40p' packages/bot/src/db.ts"],
			["write_stdin", "session 24345 · poll"],
			[
				"exec_command",
				expect.stringMatching(
					/^python3 - <<'PY' import json, sys for line in open/,
				),
			],
			["exec_command", "cat README.md"],
			["exec_command", "assist backlog view a1751"],
			["exec", 'store("item",JSON.parse(p.output));text({loaded:true});'],
			["write_stdin", String.raw`session 5586 · input "y\n"`],
			["exec", inputOf("malformed").replace(/\s+/g, " ").trim()],
		]);
	});

	it("keeps each batched call's complete arguments for expansion", () => {
		const python = tools[3];
		const cmd = field(python, "cmd") ?? "";
		expect(cmd.length).toBeGreaterThan(120);
		expect(cmd).toBe(
			"python3 - <<'PY'\nimport json, sys\nfor line in open('rollout.jsonl'):\n    row = json.loads(line)\n    if row.get('type') == 'response_item':\n        print(row['payload'].get('name'), len(row['payload'].get('input', '')))\nPY",
		);
		expect(python.target).toBe(cmd);
		expect(field(python, "max_output_tokens")).toBe("8000");
		expect(field(tools[2], "chars")).toBe('""');
		expect(field(tools[2], "yield_time_ms")).toBe("1000");
		expect(JSON.parse(field(tools[7], "chars") ?? "")).toBe("y\n");
	});

	it("keeps the unrecognised part of a mixed wrapper and the whole of a malformed one as exec rows", () => {
		expect(tools[6].target).toBe(
			'store("item",JSON.parse(p.output));text({loaded:true});',
		);
		expect(tools[8].target).toBe(inputOf("malformed").trim());
		expect(tools[8].fields).toBeUndefined();
	});

	it("does not associate the wrapper's single output with any one batched row", () => {
		expect(events.filter((e) => e.kind === "toolResult")).toHaveLength(4);
		for (const event of tools) expect(event).not.toHaveProperty("resultUrl");
	});

	it("produces identical rows on reload, repeated reads and incremental growth", () => {
		expect(reader.events(rollout)).toEqual(events);
		expect(reader.events(rollout)).toEqual(events);
		const grown = rollout.flatMap((_, i) =>
			reader.events(rollout.slice(i, i + 1)),
		);
		expect(grown).toEqual(events);
	});
});
