import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../shared", () => ({
	setStatus: vi.fn(),
}));

import { setStatus } from "../shared";
import { setStatusCommand } from "./index";

const mockSetStatus = setStatus as unknown as MockInstance;

describe("setStatusCommand", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("should set the item to a valid status", async () => {
		mockSetStatus.mockResolvedValue("Task");

		await setStatusCommand("a1", "todo");

		expect(mockSetStatus).toHaveBeenCalledWith("a1", "todo");
		expect(process.exitCode).toBeUndefined();
	});

	it("should reject an invalid status with a non-zero exit", async () => {
		const consoleSpy = vi.spyOn(console, "log");

		await setStatusCommand("1", "bogus");

		expect(mockSetStatus).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain("Invalid status");
		consoleSpy.mockRestore();
	});
});
