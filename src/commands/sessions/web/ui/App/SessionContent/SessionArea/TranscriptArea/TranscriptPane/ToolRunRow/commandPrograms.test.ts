import { describe, expect, it } from "vitest";
import { commandPrograms } from "./commandPrograms";

describe("commandPrograms", () => {
	it("names each program in a pipeline once, skipping cd", () => {
		expect(
			commandPrograms("cd /repo && grep -rn foo src | head -5; grep -c x y"),
		).toBe("grep, head");
	});

	it("keeps the subcommand of multi-command tools", () => {
		expect(commandPrograms("git log --oneline -3 && assist verify")).toBe(
			"git log, assist verify",
		);
		expect(commandPrograms("npx --yes tsx a.ts")).toBe("npx");
	});

	it("ignores separators inside quotes, env assignments and heredoc bodies", () => {
		expect(
			commandPrograms(
				`FOO=1 /usr/bin/python3 -c "a | b" <<'EOF'\nrm -rf x\nEOF`,
			),
		).toBe("python3");
	});

	it("names programs inside command substitutions", () => {
		expect(commandPrograms("f=$(grep -rl x dist | head -1); echo $f")).toBe(
			"grep, head, echo",
		);
		expect(commandPrograms("S=/tmp; F=$(ls ~/.claude/projec")).toBe("ls");
	});
});
