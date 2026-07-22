import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { retrySession } from "./retrySession";
import { runRetry } from "./runRetry";
import { serverRunMeta } from "./serverRunMeta";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./serverRunMeta", () => ({ serverRunMeta: vi.fn() }));
vi.mock("./retrySession", () => ({ retrySession: vi.fn(() => true) }));

const meta = vi.mocked(serverRunMeta);
const retry = vi.mocked(retrySession);

function deps() {
	return {
		clients: new Set<never>(),
		onStatusChange: vi.fn(),
		dismiss: vi.fn(),
		notify: vi.fn(),
	};
}

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("runRetry", () => {
	beforeEach(() => {
		meta.mockReset();
		retry.mockClear();
	});

	it("blocks relaunch with a conflict when another server is live for the origin", () => {
		meta.mockReturnValue({ server: true, origin: "gh/o/r" });
		const target = {
			id: "2",
			commandType: "run",
			runName: "dev",
			status: "done",
		} as unknown as Session;
		const live = {
			id: "1",
			name: "run: dev",
			server: true,
			serverOrigin: "gh/o/r",
			serverPort: 3000,
			status: "running",
		} as unknown as Session;
		const d = deps();

		const conflict = runRetry(map(live, target), "2", false, d);

		expect(conflict).toEqual({
			id: "1",
			name: "run: dev",
			cwd: undefined,
			port: 3000,
		});
		expect(retry).not.toHaveBeenCalled();
	});

	it("replaces the live server and relaunches when replace is true", () => {
		meta.mockReturnValue({ server: true, origin: "gh/o/r" });
		const target = {
			id: "2",
			commandType: "run",
			runName: "dev",
			status: "done",
		} as unknown as Session;
		const live = {
			id: "1",
			server: true,
			serverOrigin: "gh/o/r",
			status: "running",
		} as unknown as Session;
		const d = deps();

		const conflict = runRetry(map(live, target), "2", true, d);

		expect(conflict).toBeNull();
		expect(d.dismiss).toHaveBeenCalledWith("1");
		expect(retry).toHaveBeenCalledOnce();
		expect(d.notify).toHaveBeenCalledOnce();
		expect(target.server).toBe(true);
		expect(target.serverOrigin).toBe("gh/o/r");
	});

	it("relaunches without a prompt when no server is live", () => {
		meta.mockReturnValue({ server: true, origin: "gh/o/r" });
		const target = {
			id: "2",
			commandType: "run",
			runName: "dev",
			status: "done",
		} as unknown as Session;
		const d = deps();

		expect(runRetry(map(target), "2", false, d)).toBeNull();
		expect(retry).toHaveBeenCalledOnce();
	});
});
