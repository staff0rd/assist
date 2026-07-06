import { describe, expect, it, vi } from "vitest";
import { branch } from "./branch";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});

describe("branch", () => {
	it("exits with a clear message when the slug looks like a backlog ID", () => {
		expect(() => branch("fix-404-page", {})).toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockError).toHaveBeenCalledWith(expect.stringContaining("backlog"));
	});
});
