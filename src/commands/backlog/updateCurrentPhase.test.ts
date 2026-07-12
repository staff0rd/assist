import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { updateCurrentPhase } from "./updateCurrentPhase";

const mockAppendDaemonLog = appendDaemonLog as unknown as MockInstance;

function makeOrm(previousPhase: number | null) {
	const update = vi.fn(() => ({
		set: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
	}));
	const orm = {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: vi
						.fn()
						.mockResolvedValue(
							previousPhase === null ? [] : [{ currentPhase: previousPhase }],
						),
				})),
			})),
		})),
		update,
	};
	return orm as never;
}

describe("updateCurrentPhase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("logs a backward move so a rewind always has an audit trail", async () => {
		await updateCurrentPhase(makeOrm(3), 7, 2);

		expect(mockAppendDaemonLog).toHaveBeenCalledTimes(1);
		expect(mockAppendDaemonLog.mock.calls[0][0]).toContain("3 -> 2");
	});

	it("does not log a forward move", async () => {
		await updateCurrentPhase(makeOrm(2), 7, 3);

		expect(mockAppendDaemonLog).not.toHaveBeenCalled();
	});

	it("does not log when there is no previous phase", async () => {
		await updateCurrentPhase(makeOrm(null), 7, 1);

		expect(mockAppendDaemonLog).not.toHaveBeenCalled();
	});
});
