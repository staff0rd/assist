import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { parkedExitCode } from "../../backlog/parkedExitCode";
import { handlePtyExit } from "./handlePtyExit";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./watchActivity", () => ({ refreshActivity: vi.fn() }));

describe("handlePtyExit with the parked exit code", () => {
	it("parks a backlog run instead of erroring it", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "a1682"],
		});
		const onStatusChange = vi.fn();
		handlePtyExit(session, parkedExitCode, onStatusChange);
		expect(onStatusChange).toHaveBeenCalledWith(
			session,
			"parked",
			parkedExitCode,
		);
		expect(session.error).toBeUndefined();
	});

	it("errors any other session exiting with that code", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run-phase", "a1682", "2"],
		});
		const onStatusChange = vi.fn();
		handlePtyExit(session, parkedExitCode, onStatusChange);
		expect(onStatusChange).toHaveBeenCalledWith(
			session,
			"error",
			parkedExitCode,
		);
	});
});
