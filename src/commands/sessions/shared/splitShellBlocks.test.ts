import { describe, expect, it } from "vitest";
import { formatShellBlocks } from "./formatShellBlocks";
import { splitShellBlocks } from "./splitShellBlocks";

describe("splitShellBlocks", () => {
	it("splits held shell results from the message they were sent with", () => {
		const blocks = formatShellBlocks([
			{
				command: "npm test",
				output: [
					{ stream: "stdout", text: "ok\n" },
					{ stream: "stderr", text: "warn\n" },
				],
			},
			{ command: "ls", output: [{ stream: "stdout", text: "a\nb\n" }] },
		]);
		expect(splitShellBlocks(`${blocks}\n\nNow add jitter`)).toEqual({
			shells: [
				{ command: "npm test", stdout: "ok", stderr: "warn" },
				{ command: "ls", stdout: "a\nb", stderr: "" },
			],
			text: "Now add jitter",
		});
	});

	it("leaves a terminal bash-mode input with no output beside it alone", () => {
		expect(splitShellBlocks("<bash-input>ls</bash-input>")).toBeNull();
	});

	it("returns null for a message with no shell blocks", () => {
		expect(splitShellBlocks("hello")).toBeNull();
	});
});
