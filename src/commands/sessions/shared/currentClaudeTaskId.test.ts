import { readlinkSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { currentClaudeTaskId } from "./currentClaudeTaskId";

vi.mock("node:fs", () => ({ readlinkSync: vi.fn() }));

const readlink = vi.mocked(readlinkSync);

describe("currentClaudeTaskId", () => {
	beforeEach(() => readlink.mockReset());

	it("reads the task id from Claude's task output file", () => {
		readlink.mockReturnValue(
			"/tmp/claude-1000/-home-x/abc/tasks/bc6snjvkh.output" as never,
		);
		expect(currentClaudeTaskId()).toBe("bc6snjvkh");
	});

	it("is undefined when stdout is not a task output file", () => {
		readlink.mockReturnValue("/dev/pts/3" as never);
		expect(currentClaudeTaskId()).toBeUndefined();
	});

	it("is undefined when the link cannot be read", () => {
		readlink.mockImplementationOnce(() => {
			throw new Error("ENOENT");
		});
		expect(currentClaudeTaskId()).toBeUndefined();
	});
});
