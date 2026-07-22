import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { handleCreateRun } from "./handleCreateRun";
import { serverRunMeta } from "./serverRunMeta";
import type { SessionManager } from "./SessionManager";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./serverRunMeta", () => ({ serverRunMeta: vi.fn() }));

const meta = vi.mocked(serverRunMeta);

function fakeManager(existing?: Session) {
	return {
		windowsProxy: { route: vi.fn(() => false) },
		liveServerRun: vi.fn(() => existing),
		dismissSession: vi.fn(),
		spawnRun: vi.fn(() => "9"),
	} as unknown as SessionManager & {
		liveServerRun: ReturnType<typeof vi.fn>;
		dismissSession: ReturnType<typeof vi.fn>;
		spawnRun: ReturnType<typeof vi.fn>;
	};
}

function client() {
	return { send: vi.fn() };
}

describe("handleCreateRun", () => {
	beforeEach(() => meta.mockReset());

	it("rejects with run-conflict when a server is already live and replace is absent", () => {
		meta.mockReturnValue({ server: true, port: 3000, origin: "gh/o/r" });
		const existing = {
			id: "1",
			name: "run: dev",
			cwd: "/a",
			serverPort: 3000,
		} as unknown as Session;
		const m = fakeManager(existing);
		const c = client();

		handleCreateRun(c as never, m, { runName: "dev", cwd: "/b" });

		expect(m.spawnRun).not.toHaveBeenCalled();
		expect(c.send).toHaveBeenCalledWith(
			JSON.stringify({
				type: "run-conflict",
				runName: "dev",
				cwd: "/b",
				existing: { id: "1", name: "run: dev", cwd: "/a", port: 3000 },
			}),
		);
	});

	it("stops the live server then spawns when replace is true", () => {
		meta.mockReturnValue({ server: true, origin: "gh/o/r" });
		const existing = { id: "1", name: "run: dev" } as unknown as Session;
		const m = fakeManager(existing);
		const c = client();

		handleCreateRun(c as never, m, {
			runName: "dev",
			cwd: "/b",
			replace: true,
		});

		expect(m.dismissSession).toHaveBeenCalledWith("1");
		expect(m.spawnRun).toHaveBeenCalledWith("dev", [], "/b", {
			server: true,
			origin: "gh/o/r",
		});
		expect(c.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "created", sessionId: "9", isNew: true }),
		);
	});

	it("spawns immediately when no server is live for the origin", () => {
		meta.mockReturnValue({ server: true, origin: "gh/o/r" });
		const m = fakeManager(undefined);
		const c = client();

		handleCreateRun(c as never, m, { runName: "dev", cwd: "/b" });

		expect(m.dismissSession).not.toHaveBeenCalled();
		expect(m.spawnRun).toHaveBeenCalledOnce();
		expect(c.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "created", sessionId: "9", isNew: true }),
		);
	});

	it("leaves non-server runs unconstrained", () => {
		meta.mockReturnValue({ server: false });
		const m = fakeManager(undefined);
		const c = client();

		handleCreateRun(c as never, m, { runName: "build", cwd: "/b" });

		expect(m.liveServerRun).not.toHaveBeenCalled();
		expect(m.spawnRun).toHaveBeenCalledOnce();
	});
});
