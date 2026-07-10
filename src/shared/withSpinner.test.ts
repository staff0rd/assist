import { afterEach, describe, expect, it, vi } from "vitest";
import { withSpinner } from "./withSpinner";

describe("withSpinner", () => {
	const originalIsTTY = process.stderr.isTTY;

	afterEach(() => {
		process.stderr.isTTY = originalIsTTY;
		vi.restoreAllMocks();
	});

	it("returns the task result without animating when not a TTY", async () => {
		process.stderr.isTTY = false;
		const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

		const result = await withSpinner("working", async () => 42);

		expect(result).toBe(42);
		expect(write).not.toHaveBeenCalled();
	});

	it("renders and then clears the line when attached to a TTY", async () => {
		process.stderr.isTTY = true;
		const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

		const result = await withSpinner("working", async () => "done");

		expect(result).toBe("done");
		const writes = write.mock.calls.map((c) => String(c[0]));
		expect(writes.some((w) => w.includes("working"))).toBe(true);
		expect(writes.at(-1)).toBe("\r\x1b[K");
	});

	it("clears the line even when the task throws", async () => {
		process.stderr.isTTY = true;
		const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

		await expect(
			withSpinner("working", async () => {
				throw new Error("boom");
			}),
		).rejects.toThrow("boom");

		const writes = write.mock.calls.map((c) => String(c[0]));
		expect(writes.at(-1)).toBe("\r\x1b[K");
	});
});
