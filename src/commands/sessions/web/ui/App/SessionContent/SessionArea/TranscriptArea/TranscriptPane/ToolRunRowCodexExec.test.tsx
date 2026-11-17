// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { codexConversationReader } from "../../../../../../../../../shared/harnessAdapters/codexConversationReader";
import { eventTranscriptMessages } from "../../../../../../../shared/eventTranscriptMessages";
import { groupToolRuns } from "./groupToolRuns";
import { ToolRunRow } from "./ToolRunRow";

afterEach(cleanup);

function readRollout(name: string) {
	return readFileSync(
		`src/shared/harnessAdapters/fixtures/${name}.jsonl`,
		"utf8",
	)
		.split("\n")
		.filter(Boolean)
		.map((line) => JSON.parse(line));
}

function renderRollout(name = "codexExecWrappers") {
	const messages = codexConversationReader
		.events(readRollout(name))
		.flatMap(eventTranscriptMessages);
	const [run] = groupToolRuns(messages);
	if (run?.kind !== "tools") throw new Error("expected one tool run");
	render(<ToolRunRow calls={run.calls} />);
}

describe("ToolRunRow with Codex exec wrappers", () => {
	it("shows the inner tool and actual command as separate spaced parts of the row", () => {
		renderRollout();
		const rows = screen.getAllByRole("button");
		expect(rows).toHaveLength(7);
		const sed = rows[0];
		expect(sed.textContent).toBe(
			"exec_commandsed -n '90,155p' packages/web/src/CreditsChart.tsx",
		);
		const [tool, label] = sed.querySelectorAll("span");
		expect(tool.textContent).toBe("exec_command");
		expect(label.textContent).toBe(
			"sed -n '90,155p' packages/web/src/CreditsChart.tsx",
		);
		expect(rows[1].textContent).toMatch(/^exec_commandcat api\/migrate-db/);
		expect(rows[3].textContent).toBe("write_stdinsession 24345 · poll");
		expect(rows[6].textContent).toBe(
			"execconst args = buildArgs(); await tools.exec_command(args);",
		);
		expect(screen.queryByText(/text\(await/)).toBeNull();
	});

	it("expands a long multiline script to its full command and arguments", () => {
		renderRollout();
		const python = screen.getAllByRole("button")[2];
		fireEvent.click(python);
		expect(python.getAttribute("aria-expanded")).toBe("true");
		const cmd = screen.getByText(
			(_, el) =>
				el?.tagName === "DD" &&
				el.textContent?.startsWith("python3 - <<'PY'\nfrom pathlib") === true,
		);
		expect(cmd.textContent).toContain(
			"print('\\\\n'.join(part.splitlines()[6:]))\nPY",
		);
		expect(screen.getByText("max_output_tokens")).toBeTruthy();
		expect(screen.getByText("16000")).toBeTruthy();
	});

	it("expands write_stdin input to its exact characters", () => {
		renderRollout();
		fireEvent.click(screen.getAllByRole("button")[5]);
		expect(screen.getByText("chars")).toBeTruthy();
		expect(screen.getByText(String.raw`"y\n\u0003"`)).toBeTruthy();
	});

	it("expands an unsupported wrapper to its original multiline input", () => {
		renderRollout();
		fireEvent.click(screen.getAllByRole("button")[6]);
		const pre = screen.getByText((_, el) => el?.tagName === "PRE");
		expect(pre.textContent).toBe(
			"const args = buildArgs();\nawait tools.exec_command(args);",
		);
	});
});

describe("ToolRunRow with batched Codex exec wrappers", () => {
	it("shows each batched call as its own spaced row in source order", () => {
		renderRollout("codexExecBatches");
		const rows = screen.getAllByRole("button");
		expect(
			rows.map((row) =>
				[...row.querySelectorAll("span")].slice(0, 2).map((s) => s.textContent),
			),
		).toEqual([
			["exec_command", "sed -n '90,155p' packages/web/src/CreditsChart.tsx"],
			["exec_command", "sed -n '1,40p' packages/bot/src/db.ts"],
			["write_stdin", "session 24345 · poll"],
			["exec_command", expect.stringMatching(/^python3 - <<'PY' import json/)],
			["exec_command", "cat README.md"],
			["exec_command", "assist backlog view a1751"],
			["exec", 'store("item",JSON.parse(p.output));text({loaded:true});'],
			["write_stdin", String.raw`session 5586 · input "y\n"`],
			["exec", expect.stringMatching(/^text\(await tools\.exec_command/)],
		]);
		expect(screen.queryByText(/Promise\.allSettled/)).toBeNull();
	});

	it("expands a batched multiline script to its exact command", () => {
		renderRollout("codexExecBatches");
		fireEvent.click(screen.getAllByRole("button")[3]);
		const cmd = screen.getByText(
			(_, el) =>
				el?.tagName === "DD" &&
				el.textContent?.startsWith("python3 - <<'PY'\nimport json") === true,
		);
		expect(cmd.textContent).toContain("\n    row = json.loads(line)\n");
		expect(cmd.textContent?.endsWith("\nPY")).toBe(true);
	});

	it("expands a malformed wrapper to its whole original input", () => {
		renderRollout("codexExecBatches");
		fireEvent.click(screen.getAllByRole("button")[8]);
		const pre = screen.getByText((_, el) => el?.tagName === "PRE");
		expect(pre.textContent).toBe(
			'text(await tools.exec_command({cmd:"ls"}));\ntext(await tools.exec_command({cmd:"pwd"});',
		);
	});
});
