import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RunConfig } from "../../../shared/types";
import { getCurrentOrigin } from "../../backlog/getCurrentOrigin";
import { resolveRunConfig } from "./resolveRunConfig";
import { serverRunMeta } from "./serverRunMeta";

vi.mock("./resolveRunConfig", () => ({ resolveRunConfig: vi.fn() }));
vi.mock("../../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: vi.fn(() => "gh/o/r"),
}));

const config = vi.mocked(resolveRunConfig);

function run(over: Partial<RunConfig>): RunConfig {
	return { name: "dev", command: "npm", ...over } as RunConfig;
}

describe("serverRunMeta", () => {
	beforeEach(() => config.mockReset());

	it("normalises server: true to the default group", () => {
		config.mockReturnValue(run({ server: true, port: 3000 }));
		expect(serverRunMeta("dev", "/a")).toEqual({
			server: true,
			group: "default",
			port: 3000,
			origin: "gh/o/r",
		});
	});

	it("uses a string server value as the group name", () => {
		config.mockReturnValue(run({ name: "api", server: "api" }));
		expect(serverRunMeta("api", "/a")).toEqual({
			server: true,
			group: "api",
			port: undefined,
			origin: "gh/o/r",
		});
	});

	it("treats server: false and an absent server as a non-server run", () => {
		config.mockReturnValue(run({ server: false }));
		expect(serverRunMeta("dev", "/a")).toEqual({ server: false });
		config.mockReturnValue(run({}));
		expect(serverRunMeta("dev", "/a")).toEqual({ server: false });
	});

	it("reports a non-server run when the run name is unknown", () => {
		config.mockReturnValue(undefined);
		expect(serverRunMeta("nope", "/a")).toEqual({ server: false });
	});

	it("keys the origin off the run's cwd so sibling clones share a slot", () => {
		config.mockReturnValue(run({ server: "web" }));
		serverRunMeta("web", "/clone-b");
		expect(vi.mocked(getCurrentOrigin)).toHaveBeenCalledWith("/clone-b");
	});
});
