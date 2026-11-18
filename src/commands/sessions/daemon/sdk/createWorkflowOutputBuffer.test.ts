import { describe, expect, it } from "vitest";
import { createWorkflowOutputBuffer } from "./createWorkflowOutputBuffer";

describe("createWorkflowOutputBuffer", () => {
	it("splits chunks into lines and joins lines split across chunks", () => {
		const buffer = createWorkflowOutputBuffer();
		buffer.append("stdout", "[claude] Read a.ts\n[codex] ex");
		buffer.append("stdout", "ec rg foo\n");
		expect(buffer.lines()).toEqual([
			{ stream: "stdout", text: "[claude] Read a.ts" },
			{ stream: "stdout", text: "[codex] exec rg foo" },
		]);
	});

	it("keeps stdout and stderr partial lines apart", () => {
		const buffer = createWorkflowOutputBuffer();
		buffer.append("stdout", "out ");
		buffer.append("stderr", "retrying after 429\n");
		buffer.append("stdout", "more\n");
		expect(buffer.lines()).toEqual([
			{ stream: "stdout", text: "out more" },
			{ stream: "stderr", text: "retrying after 429" },
		]);
	});

	it("strips ANSI codes and carriage returns", () => {
		const buffer = createWorkflowOutputBuffer();
		buffer.append("stderr", "\x1b[31mfailed\x1b[0m\r\n");
		expect(buffer.lines()).toEqual([{ stream: "stderr", text: "failed" }]);
	});

	it("drops the oldest lines past the cap", () => {
		const buffer = createWorkflowOutputBuffer(3);
		buffer.append("stdout", "1\n2\n3\n4\n5");
		expect(buffer.lines().map((line) => line.text)).toEqual(["3", "4", "5"]);
		buffer.append("stdout", "!\n");
		expect(buffer.lines().map((line) => line.text)).toEqual(["3", "4", "5!"]);
	});

	it("starts a new line when the open line was dropped by the cap", () => {
		const buffer = createWorkflowOutputBuffer(1);
		buffer.append("stderr", "err");
		buffer.append("stdout", "out\n");
		buffer.append("stderr", " tail\n");
		expect(buffer.lines()).toEqual([{ stream: "stderr", text: " tail" }]);
	});

	it("returns copies so later appends do not mutate a published snapshot", () => {
		const buffer = createWorkflowOutputBuffer();
		buffer.append("stdout", "a");
		const snapshot = buffer.lines();
		buffer.append("stdout", "b");
		expect(snapshot).toEqual([{ stream: "stdout", text: "a" }]);
	});

	it("truncates a line that grows past the per-line cap", () => {
		const buffer = createWorkflowOutputBuffer(10, 5);
		buffer.append("stdout", "abc");
		buffer.append("stdout", "defgh\nxyz123456\n");
		expect(buffer.lines().map((line) => line.text)).toEqual(["abcde", "xyz12"]);
	});
});
