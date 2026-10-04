import { describe, expect, it, vi } from "vitest";
import type { PersistedSession } from "./persistedSessionSchema";
import { restoreBase } from "./restoreBase";

vi.mock("../../backlog/consumePause", () => ({ isPausePending: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function persisted(
	overrides: Partial<PersistedSession> = {},
): PersistedSession {
	return {
		name: "s",
		commandType: "assist",
		cwd: "/repo",
		startedAt: 1,
		...overrides,
	};
}

describe("restoreBase", () => {
	it("keeps a persisted star", () => {
		expect(restoreBase("1", persisted({ starred: true })).starred).toBe(true);
	});

	it("keeps the divergence escalation flag", () => {
		expect(
			restoreBase("1", persisted({ divergenceEscalation: true }))
				.divergenceEscalation,
		).toBe(true);
	});
});
