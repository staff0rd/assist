import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startWebServer } from "../../../shared/web";
import { ensureDaemonRunning } from "../daemon/ensureDaemonRunning";
import { web } from "./index";

vi.mock("../../../shared/web", () => ({ startWebServer: vi.fn() }));
vi.mock("../daemon/ensureDaemonRunning", () => ({
	ensureDaemonRunning: vi.fn(() => Promise.resolve()),
}));
vi.mock("./handleRequest", () => ({ handleRequest: vi.fn() }));
vi.mock("./handleSocket", () => ({ handleSocket: vi.fn() }));
vi.mock("./restartMenu/installRestartMenu", () => ({
	installRestartMenu: vi.fn(),
}));
vi.mock("../../../shared/getInstallDir", () => ({ isGitRepo: () => false }));

const startMock = startWebServer as unknown as ReturnType<typeof vi.fn>;
const ensureMock = ensureDaemonRunning as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
	startMock.mockReset();
	ensureMock.mockReset();
	ensureMock.mockResolvedValue(undefined);
	startMock.mockReturnValue(new EventEmitter());
});

afterEach(() => {
	vi.restoreAllMocks();
});

function flush(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve));
}

describe("web", () => {
	it("binds the web server before ensuring the daemon", async () => {
		const order: string[] = [];
		startMock.mockImplementation(() => {
			order.push("bind");
			return new EventEmitter();
		});
		ensureMock.mockImplementation(() => {
			order.push("ensure");
			return Promise.resolve();
		});

		await web({ port: "3100" });

		expect(order[0]).toBe("bind");
	});

	it("binds the web server even when the daemon ensure rejects", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		ensureMock.mockRejectedValue(new Error("daemon stalled behind ssh prompt"));

		await expect(web({ port: "3100" })).resolves.toBeUndefined();
		await flush();

		expect(startMock).toHaveBeenCalledTimes(1);
	});
});
