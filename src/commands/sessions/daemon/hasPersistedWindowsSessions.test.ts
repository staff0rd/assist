import { existsSync, readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../../shared/loadConfig";
import { hasPersistedWindowsSessions } from "./hasPersistedWindowsSessions";

vi.mock("../../../shared/loadConfig", () => ({ loadConfig: vi.fn() }));
vi.mock("node:fs", () => ({ existsSync: vi.fn(), readFileSync: vi.fn() }));

const loadConfigMock = loadConfig as unknown as ReturnType<typeof vi.fn>;
const existsSyncMock = existsSync as unknown as ReturnType<typeof vi.fn>;
const readFileSyncMock = readFileSync as unknown as ReturnType<typeof vi.fn>;

const WINDOWS_ROOT = "/mnt/c/Users/me/.claude/projects";
const SESSIONS_FILE = "/mnt/c/Users/me/.assist/sessions.json";

describe("hasPersistedWindowsSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		loadConfigMock.mockReturnValue({
			sessions: { windowsProjectsRoot: WINDOWS_ROOT },
		});
	});

	it("returns false and touches no files when windowsProjectsRoot is unset", () => {
		loadConfigMock.mockReturnValue({});
		expect(hasPersistedWindowsSessions()).toBe(false);
		expect(existsSyncMock).not.toHaveBeenCalled();
	});

	it("derives the windows sessions.json path from windowsProjectsRoot", () => {
		existsSyncMock.mockReturnValue(true);
		readFileSyncMock.mockReturnValue(JSON.stringify([{ name: "s" }]));
		expect(hasPersistedWindowsSessions()).toBe(true);
		expect(existsSyncMock).toHaveBeenCalledWith(SESSIONS_FILE);
		expect(readFileSyncMock).toHaveBeenCalledWith(SESSIONS_FILE, "utf8");
	});

	it("returns false when the sessions file is missing", () => {
		existsSyncMock.mockReturnValue(false);
		expect(hasPersistedWindowsSessions()).toBe(false);
		expect(readFileSyncMock).not.toHaveBeenCalled();
	});

	it("returns false when the persisted list is empty", () => {
		existsSyncMock.mockReturnValue(true);
		readFileSyncMock.mockReturnValue("[]");
		expect(hasPersistedWindowsSessions()).toBe(false);
	});

	it("returns false when the file is unreadable or malformed", () => {
		existsSyncMock.mockReturnValue(true);
		readFileSyncMock.mockReturnValue("{not json");
		expect(hasPersistedWindowsSessions()).toBe(false);
	});
});
