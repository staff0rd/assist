import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessesModule from "../../../../shared/harnesses";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { addAgentToStream } from "./addAgentToStream";
import type { TreeSpawnContext } from "./spawnInTree";
import { spawnIntoStream } from "./spawnIntoStream";

const env = vi.hoisted(() => ({ installed: new Set<string>() }));

vi.mock("../../../../shared/harnesses", async () => ({
	...(await vi.importActual<typeof harnessesModule>(
		"../../../../shared/harnesses",
	)),
	isHarnessAvailable: (kind: string) => env.installed.has(kind),
}));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./joinableStream", () => ({
	joinableStream: (sessions: Map<string, Session>, id: string) => {
		const session = sessions.get(id);
		return session ? { session } : { reason: "no such session" };
	},
}));
vi.mock("./spawnIntoStream", () => ({ spawnIntoStream: vi.fn(() => "9") }));

function context(target: Session): TreeSpawnContext {
	return {
		sessions: new Map([[target.id, target]]),
		spawnWith: vi.fn(),
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

const codexStream = makeSession({ id: "3", harness: "codex", cwd: "/repo-2" });

describe("addAgentToStream", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		env.installed = new Set(["codex", "pi"]);
	});

	it("adds the agent on the stream's own harness when none is picked, with Claude absent", () => {
		const ctx = context(codexStream);

		expect(addAgentToStream(ctx, "3", { prompt: "help" })).toEqual({
			sessionId: "9",
		});
		expect(spawnIntoStream).toHaveBeenCalledWith(ctx, codexStream, {
			prompt: "help",
			harness: "codex",
		});
	});

	it("keeps an explicitly picked harness", () => {
		const ctx = context(codexStream);

		addAgentToStream(ctx, "3", { harness: "pi" });

		expect(spawnIntoStream).toHaveBeenCalledWith(ctx, codexStream, {
			harness: "pi",
		});
	});

	it("refuses with the resolver's reasons, without spawning, when that harness is unavailable", () => {
		const ctx = context(codexStream);

		const result = addAgentToStream(ctx, "3", { harness: "claude" });

		expect(result).toEqual({
			reason: expect.stringContaining("A new session is unavailable on Claude"),
		});
		expect(spawnIntoStream).not.toHaveBeenCalled();
	});
});
