import { beforeEach, describe, expect, it, vi } from "vitest";
import { isWindowsDaemonRunning } from "./connectToWindowsDaemon";
import { discoverWindowsSessions } from "./discoverWindowsSessions";
import { hasPersistedWindowsSessions } from "./hasPersistedWindowsSessions";
import type { WindowsConnection } from "./WindowsConnection";

vi.mock("./connectToWindowsDaemon", () => ({
	isWindowsDaemonRunning: vi.fn(),
}));
vi.mock("./hasPersistedWindowsSessions", () => ({
	hasPersistedWindowsSessions: vi.fn(),
}));

const isRunningMock = isWindowsDaemonRunning as unknown as ReturnType<
	typeof vi.fn
>;
const hasPersistedMock = hasPersistedWindowsSessions as unknown as ReturnType<
	typeof vi.fn
>;

function fakeConn(connected = false): WindowsConnection & {
	ensure: ReturnType<typeof vi.fn>;
} {
	return {
		connected,
		ensure: vi.fn().mockResolvedValue(undefined),
	} as unknown as WindowsConnection & { ensure: ReturnType<typeof vi.fn> };
}

describe("discoverWindowsSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		isRunningMock.mockResolvedValue(false);
		hasPersistedMock.mockReturnValue(false);
	});

	it("does nothing when already connected", async () => {
		const conn = fakeConn(true);
		await discoverWindowsSessions(conn);
		expect(isRunningMock).not.toHaveBeenCalled();
		expect(conn.ensure).not.toHaveBeenCalled();
	});

	it("connects to an already-running windows daemon", async () => {
		isRunningMock.mockResolvedValue(true);
		const conn = fakeConn();
		await discoverWindowsSessions(conn);
		expect(conn.ensure).toHaveBeenCalledTimes(1);
	});

	it("launches the windows daemon when it is down but has persisted sessions", async () => {
		isRunningMock.mockResolvedValue(false);
		hasPersistedMock.mockReturnValue(true);
		const conn = fakeConn();
		await discoverWindowsSessions(conn);
		expect(conn.ensure).toHaveBeenCalledTimes(1);
	});

	it("leaves an idle host alone: down daemon with no persisted sessions", async () => {
		isRunningMock.mockResolvedValue(false);
		hasPersistedMock.mockReturnValue(false);
		const conn = fakeConn();
		await discoverWindowsSessions(conn);
		expect(conn.ensure).not.toHaveBeenCalled();
	});

	it("swallows a connection failure", async () => {
		isRunningMock.mockResolvedValue(true);
		const conn = fakeConn();
		conn.ensure.mockRejectedValue(new Error("boom"));
		await expect(discoverWindowsSessions(conn)).resolves.toBeUndefined();
	});
});
