import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { codexConversationReader as reader } from "../codexConversationReader";

const rollout = readFileSync(
	new URL("../fixtures/codexExecWrappers.jsonl", import.meta.url),
	"utf8",
)
	.split("\n")
	.filter(Boolean)
	.map((line) => JSON.parse(line));

const inputOf = (i: number): string => rollout[i].payload.input;
const field = (event: unknown, name: string) =>
	(event as { fields?: { name: string; value: string }[] }).fields?.find(
		(f) => f.name === name,
	)?.value;

describe("codex exec wrapper events", () => {
	const events = reader.events(rollout);

	it("gives each supplied single-call wrapper one row named after its inner tool", () => {
		expect(events.map((e) => (e.kind === "tool" ? e.tool : e.kind))).toEqual([
			"exec_command",
			"exec_command",
			"exec_command",
			"write_stdin",
			"write_stdin",
			"write_stdin",
			"exec",
		]);
	});

	it("labels exec_command rows with the actual command", () => {
		expect(events[0]).toMatchObject({
			label: "sed -n '90,155p' packages/web/src/CreditsChart.tsx",
			target: "sed -n '90,155p' packages/web/src/CreditsChart.tsx",
			fields: [
				{
					name: "cmd",
					value: "sed -n '90,155p' packages/web/src/CreditsChart.tsx",
				},
				{ name: "workdir", value: "/repo" },
				{ name: "yield_time_ms", value: "10000" },
				{ name: "max_output_tokens", value: "30000" },
			],
		});
		expect(events[1]).toMatchObject({
			label:
				"cat api/migrate-db/migrations/1790812800000-CoachingAssignmentRole.ts",
		});
	});

	it("keeps a long multiline script whole for expansion, shortening only the label", () => {
		const cmd = field(events[2], "cmd") ?? "";
		expect(cmd.length).toBeGreaterThan(120);
		expect(cmd).toContain(
			"\nfor part in s.split('        diff --git ')[1:]:\n name=",
		);
		expect(cmd.endsWith("\nPY")).toBe(true);
		expect(events[2]).toMatchObject({ target: cmd });
		const label = (events[2] as { label: string }).label;
		expect(label).not.toContain("\n");
		expect(label.startsWith("python3 - <<'PY' from pathlib import Path")).toBe(
			true,
		);
	});

	it("labels write_stdin rows by session and poll or input, keeping exact characters", () => {
		expect(events[3]).toMatchObject({
			label: "session 24345 · poll",
			fields: [
				{ name: "session_id", value: "24345" },
				{ name: "chars", value: '""' },
				{ name: "yield_time_ms", value: "1000" },
				{ name: "max_output_tokens", value: "5000" },
			],
		});
		expect(events[4]).toMatchObject({ label: "session 94296 · poll" });
		expect(events[5]).toMatchObject({
			label: 'session 5586 · input "y\\n\\u0003"',
		});
		expect(JSON.parse(field(events[5], "chars") ?? "")).toBe("y\n\u0003");
	});

	it("keeps an unsupported wrapper as an exec row with its original input", () => {
		expect(events[6]).toEqual({
			kind: "tool",
			tool: "exec",
			target: inputOf(6).trim(),
			label: "const args = buildArgs(); await tools.exec_command(args);",
			operations: [],
			at: rollout[6].timestamp,
		});
	});

	it("produces the same rows on reload and as the rollout grows", () => {
		expect(reader.events(rollout)).toEqual(events);
		const grown = rollout.flatMap((_, i) =>
			reader.events(rollout.slice(i, i + 1)),
		);
		expect(grown).toEqual(events);
	});

	it("keeps the wrapper's policy operations instead of reclassifying it as a shell command", () => {
		for (const event of events)
			expect(event.kind === "tool" && event.operations).toEqual([]);
	});
});
