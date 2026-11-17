import { describe, expect, it } from "vitest";
import { parseCodexExecWrapper } from "./parseCodexExecWrapper";

const exec = (args: string) => `tools.exec_command(${args})`;

describe("parseCodexExecWrapper", () => {
	it.each([
		["text(await)", "text(await CALL);"],
		["const r", "const r = await CALL; text(r.output);"],
		["no semicolons", "const r=await CALL\ntext(r.output)"],
		["stringify", "let out = await CALL;\ntext(JSON.stringify(out));"],
		["output prop", "text((await CALL).output);"],
		["pragma", '// @exec: {"yield_time_ms": 1000}\ntext(await CALL);'],
		["spaced", "  text( await\n  CALL )  ;\n"],
	])("reads a literal call in the %s shape", (_, shape) => {
		const input = shape.replace(
			"CALL",
			exec('{cmd:"ls -la", "max_output_tokens":10}'),
		);
		expect(parseCodexExecWrapper(input)).toEqual([
			{ tool: "exec_command", args: { cmd: "ls -la", max_output_tokens: 10 } },
		]);
	});

	it("decodes quotes, escapes and multiline template literals exactly", () => {
		const input =
			"text(await tools.exec_command({'cmd': `python3 - <<'PY'\nprint(\"a\\tb\")\nPY`, extra: [1, -2.5, true, null, {k: '\\u0041\\x42\\''}],}));";
		expect(parseCodexExecWrapper(input)?.[0].args).toEqual({
			cmd: "python3 - <<'PY'\nprint(\"a\tb\")\nPY",
			extra: [1, -2.5, true, null, { k: "AB'" }],
		});
	});

	it("reads write_stdin with its session and characters", () => {
		expect(
			parseCodexExecWrapper(
				String.raw`text(await tools.write_stdin({session_id:5586,chars:"y\n\u0003"}));`,
			),
		).toEqual([
			{ tool: "write_stdin", args: { session_id: 5586, chars: "y\n\u0003" } },
		]);
	});

	it.each([
		[
			"dynamic args",
			"const args = buildArgs();\nawait tools.exec_command(args);",
		],
		["computed value", "text(await tools.exec_command({cmd: base + ' -la'}));"],
		["shorthand", "text(await tools.exec_command({cmd}));"],
		[
			"interpolation",
			"text(await tools.exec_command({cmd: `ls $" + "{dir}`}));",
		],
		[
			"extra code",
			"text(await tools.exec_command({cmd: 'ls'})); store('x', 1);",
		],
		["other tool", "text(await tools.web__run({q: 'x'}));"],
		["unterminated", "text(await tools.exec_command({cmd: 'ls"],
		["unclosed call", "text(await tools.exec_command({cmd: 'ls'}"],
		["bad escape", String.raw`text(await tools.exec_command({cmd: '\u12'}));`],
		[
			"two calls",
			"text(await tools.exec_command({cmd:'a'}));text(await tools.exec_command({cmd:'b'}));",
		],
		["empty", ""],
	])("returns null for %s", (_, input) => {
		expect(parseCodexExecWrapper(input)).toBeNull();
	});
});
