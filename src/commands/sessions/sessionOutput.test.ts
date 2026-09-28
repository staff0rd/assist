import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestSessionOutput } from "./daemon/requestSessionOutput";
import { lastLines } from "./lastLines";
import { sessionOutput } from "./sessionOutput";

vi.mock("./daemon/requestSessionOutput", () => ({
	requestSessionOutput: vi.fn(),
}));

const requestMock = requestSessionOutput as unknown as ReturnType<typeof vi.fn>;
const ESC = String.fromCharCode(27);

describe("lastLines", () => {
	it("strips ANSI codes and splits pty line endings", () => {
		expect(lastLines(`${ESC}[32mready${ESC}[0m\r\nlistening\r\n`, 10)).toEqual([
			"ready",
			"listening",
		]);
	});

	it("keeps only the last count lines", () => {
		expect(lastLines("a\nb\nc\nd", 2)).toEqual(["c", "d"]);
	});

	it("returns no lines for empty scrollback", () => {
		expect(lastLines("", 5)).toEqual([]);
	});
});

describe("sessionOutput", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	const printed = () =>
		(console.log as unknown as ReturnType<typeof vi.fn>).mock.calls.map(
			([line]) => line,
		);

	it("prints the last 200 lines by default", async () => {
		const all = Array.from({ length: 250 }, (_, i) => `line ${i}`);
		requestMock.mockResolvedValue(all.join("\n"));

		await sessionOutput("7", { lines: "200" });

		expect(requestMock).toHaveBeenCalledWith("7");
		expect(printed()).toEqual(all.slice(-200));
		expect(process.exitCode).toBeUndefined();
	});

	it("prints the requested number of lines", async () => {
		requestMock.mockResolvedValue("a\nb\nc\n");

		await sessionOutput("7", { lines: "2" });

		expect(printed()).toEqual(["b", "c"]);
	});

	it("rejects a linked-node session id without asking the daemon", async () => {
		await sessionOutput("win:3", { lines: "200" });

		expect(requestMock).not.toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith(
			"Session win:3 is on a linked node; reading linked-node sessions is not supported yet",
		);
		expect(process.exitCode).toBe(1);
	});

	it("rejects a non-positive line count", async () => {
		await sessionOutput("7", { lines: "0" });

		expect(requestMock).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it.each(["No sessions daemon is running", "No session 99 on this node"])(
		"reports %s and exits 1",
		async (message) => {
			requestMock.mockRejectedValue(new Error(message));

			await sessionOutput("99", { lines: "200" });

			expect(console.error).toHaveBeenCalledWith(message);
			expect(printed()).toEqual([]);
			expect(process.exitCode).toBe(1);
		},
	);
});
