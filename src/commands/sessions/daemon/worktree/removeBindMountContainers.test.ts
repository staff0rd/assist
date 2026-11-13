import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanLeftoversEnabled } from "./cleanLeftoversEnabled";
import { docker } from "./docker";
import { removeBindMountContainers } from "./removeBindMountContainers";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./cleanLeftoversEnabled", () => ({
	cleanLeftoversEnabled: vi.fn(() => true),
}));

const dockerMock = vi.mocked(docker);

const containers = [
	{
		Id: "a1",
		Name: "/apm-azurite-bootstrap-1",
		Mounts: [{ Type: "bind", Source: "/git/apm-11/docker-local/azure" }],
	},
	{
		Id: "b2",
		Name: "/apm-otel-1",
		HostConfig: { Binds: ["/git/apm-11/docker-local/otel:/etc/otel:ro"] },
	},
	{
		Id: "c3",
		Name: "/apm-db-1",
		Config: {
			Labels: { "com.docker.compose.project.working_dir": "/git/apm-11" },
		},
	},
	{
		Id: "d4",
		Name: "/apm-other-1",
		Mounts: [
			{ Type: "bind", Source: "/git/apm-110/docker-local/azure" },
			{ Type: "volume", Source: "/git/apm-11/volume" },
		],
	},
];

function answerDocker() {
	dockerMock.mockImplementation(async (args) => {
		if (args[0] === "info") return "27.0.0";
		if (args[0] === "ps") return "a1\nb2\nc3\nd4\n";
		if (args[0] === "inspect") return JSON.stringify(containers);
		return "";
	});
}

const removed = () =>
	dockerMock.mock.calls
		.filter(([args]) => args[0] === "rm")
		.map(([args]) => args[2]);

describe("removeBindMountContainers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(cleanLeftoversEnabled).mockReturnValue(true);
	});

	it("removes every container bind-mounting inside the worktree, and no others", async () => {
		answerDocker();

		await removeBindMountContainers("/git/apm-11");

		expect(removed()).toEqual(["a1", "b2", "c3"]);
	});

	it("skips cleanup when Docker is not reachable", async () => {
		dockerMock.mockRejectedValue(new Error("command not found: docker"));

		await removeBindMountContainers("/git/apm-11");

		expect(dockerMock).toHaveBeenCalledTimes(1);
		expect(removed()).toEqual([]);
	});

	it("does nothing when sessions.cleanLeftovers is false", async () => {
		vi.mocked(cleanLeftoversEnabled).mockReturnValue(false);
		answerDocker();

		await removeBindMountContainers("/git/apm-11");

		expect(dockerMock).not.toHaveBeenCalled();
	});
});
