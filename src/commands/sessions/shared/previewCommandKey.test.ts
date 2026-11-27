import { Command } from "commander";
import { describe, expect, it } from "vitest";
import {
	previewCommandKey,
	recordPreviewCommandKey,
} from "./previewCommandKey";

function run(argv: string[]): string | undefined {
	const program = new Command().name("assist");
	program.hook("preAction", (_root, action) => recordPreviewCommandKey(action));
	const prs = program.command("prs");
	prs.command("wontfix <comment-id> <reason>").action(() => {});
	prs.command("review-reply <review-id> <body>").action(() => {});
	program
		.command("ask")
		.option("--title <title>")
		.action(() => {});
	previewCommandKey.value = undefined;
	program.parse(argv, { from: "user" });
	return previewCommandKey.value;
}

describe("recordPreviewCommandKey", () => {
	it("keys a command by its path and target, not its free text", () => {
		expect(run(["prs", "wontfix", "11", "out of scope"])).toBe(
			"prs wontfix 11",
		);
		expect(run(["prs", "wontfix", "11", "revised"])).toBe("prs wontfix 11");
		expect(run(["prs", "review-reply", "42", "-"])).toBe("prs review-reply 42");
	});

	it("keys a command without arguments by its path", () => {
		expect(run(["ask", "--title", "Plan"])).toBe("ask");
	});
});
