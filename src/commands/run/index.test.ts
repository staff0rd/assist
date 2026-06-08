import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RunConfig } from "../../shared/types";

const mockLookupRunConfig = vi.fn();
const mockFindRunConfig = vi.fn();
const mockPullIfConfigured = vi.fn();
const mockBacklogRun = vi.fn();
const mockSpawnRunCommand = vi.fn();
const mockResolveParams = vi.fn<(...args: unknown[]) => string[]>(() => []);
const mockRunPreCommands = vi.fn();

vi.mock("./findRunConfig", () => ({
	lookupRunConfig: (name: string) => mockLookupRunConfig(name),
	findRunConfig: (name: string) => mockFindRunConfig(name),
	requireRunConfigs: vi.fn(() => []),
}));

vi.mock("../../shared/pullIfConfigured", () => ({
	pullIfConfigured: () => mockPullIfConfigured(),
}));

vi.mock("../backlog/run", () => ({
	run: (id: string, opts: unknown) => mockBacklogRun(id, opts),
}));

vi.mock("./spawnRunCommand", () => ({
	spawnRunCommand: (...args: unknown[]) => mockSpawnRunCommand(...args),
}));

vi.mock("./resolveParams", () => ({
	resolveParams: (...args: unknown[]) => mockResolveParams(...args),
}));

vi.mock("./runPreCommands", () => ({
	runPreCommands: (...args: unknown[]) => mockRunPreCommands(...args),
}));

vi.mock("../../shared/loadConfig", () => ({
	getConfigDir: () => "/tmp",
}));

import { run } from ".";

const sampleConfig: RunConfig = {
	name: "deploy",
	command: "echo",
};

beforeEach(() => {
	vi.clearAllMocks();
	mockResolveParams.mockReturnValue([]);
});

describe("run", () => {
	it("delegates a purely numeric arg with no matching config to backlog run", async () => {
		mockLookupRunConfig.mockReturnValue({ kind: "not-found" });

		await run("12", []);

		expect(mockPullIfConfigured).toHaveBeenCalledTimes(1);
		expect(mockBacklogRun).toHaveBeenCalledWith("12", { allowEdits: true });
		expect(mockFindRunConfig).not.toHaveBeenCalled();
		expect(mockSpawnRunCommand).not.toHaveBeenCalled();
	});

	it("forwards --no-write to backlog run as allowEdits: false", async () => {
		mockLookupRunConfig.mockReturnValue({ kind: "not-found" });

		await run("12", ["--no-write"]);

		expect(mockBacklogRun).toHaveBeenCalledWith("12", { allowEdits: false });
	});

	it("forwards --write to backlog run as allowEdits: true", async () => {
		mockLookupRunConfig.mockReturnValue({ kind: "not-found" });

		await run("12", ["--write"]);

		expect(mockBacklogRun).toHaveBeenCalledWith("12", { allowEdits: true });
	});

	it("forwards -w to backlog run as allowEdits: true", async () => {
		mockLookupRunConfig.mockReturnValue({ kind: "not-found" });

		await run("12", ["-w"]);

		expect(mockBacklogRun).toHaveBeenCalledWith("12", { allowEdits: true });
	});

	it("errors on extra non-flag args when delegating to backlog run", async () => {
		mockLookupRunConfig.mockReturnValue({ kind: "not-found" });
		const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit(1)");
		}) as never);
		vi.spyOn(console, "error").mockImplementation(() => {});

		await expect(run("12", ["extra"])).rejects.toThrow("process.exit(1)");
		expect(mockBacklogRun).not.toHaveBeenCalled();

		exitSpy.mockRestore();
	});

	it("runs the matching config when a numeric name matches a config", async () => {
		const config: RunConfig = { name: "12", command: "echo" };
		mockLookupRunConfig.mockReturnValue({ kind: "match", config });
		mockFindRunConfig.mockReturnValue(config);

		await run("12", ["arg"]);

		expect(mockBacklogRun).not.toHaveBeenCalled();
		expect(mockFindRunConfig).toHaveBeenCalledWith("12");
		expect(mockSpawnRunCommand).toHaveBeenCalled();
	});

	it("runs the matching config for a non-numeric name without consulting backlog", async () => {
		mockFindRunConfig.mockReturnValue(sampleConfig);

		await run("deploy", []);

		expect(mockLookupRunConfig).not.toHaveBeenCalled();
		expect(mockBacklogRun).not.toHaveBeenCalled();
		expect(mockFindRunConfig).toHaveBeenCalledWith("deploy");
		expect(mockSpawnRunCommand).toHaveBeenCalled();
	});

	it("keeps existing not-found error behavior for a non-numeric name", async () => {
		mockFindRunConfig.mockImplementation(() => {
			throw new Error("process.exit(1)");
		});

		await expect(run("nope", [])).rejects.toThrow("process.exit(1)");
		expect(mockBacklogRun).not.toHaveBeenCalled();
	});
});
