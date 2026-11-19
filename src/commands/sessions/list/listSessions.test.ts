import { afterEach, describe, expect, it, vi } from "vitest";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { listSessions } from "./listSessions";

vi.mock("../daemon/connectToDaemon", () => ({ connectToDaemon: vi.fn() }));

describe("listSessions", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		process.exitCode = undefined;
	});

	it("fails when no daemon is running", async () => {
		vi.mocked(connectToDaemon).mockRejectedValue(new Error("ENOENT"));
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		await listSessions({});
		expect(error).toHaveBeenCalledWith("No sessions daemon is running");
		expect(process.exitCode).toBe(1);
	});
});
