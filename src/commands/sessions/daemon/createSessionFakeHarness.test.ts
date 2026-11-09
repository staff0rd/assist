import { describe, expect, it, vi } from "vitest";
import type { HarnessAdapter } from "../../../shared/harnessAdapters/types";
import {
	type FakeHarnessCalls,
	fakeHarnessMock,
} from "../../../test/mocks/fakeHarnessMock";

const state = vi.hoisted(() => ({
	adapter: undefined as HarnessAdapter | undefined,
}));

vi.mock("../../../shared/harnessAdapters/harnessAdapter", () => ({
	harnessAdapter: () => state.adapter,
}));

import { createSession } from "./createSession";

describe("createSession on a fake harness", () => {
	it("launches through the adapter's interactive operation and records its identity", () => {
		const calls: FakeHarnessCalls = { interactive: [], oneShot: [] };
		state.adapter = fakeHarnessMock(calls);

		const session = createSession("7", {
			prompt: "go",
			cwd: "/repo",
			auto: true,
		});

		expect(calls.interactive).toEqual([
			{
				prompt: "go",
				cwd: "/repo",
				sessionId: "7",
				conversationId: undefined,
				design: undefined,
				auto: true,
			},
		]);
		expect(session.pty).toEqual({ pid: 4242 });
		expect(session.claudeSessionId).toBeUndefined();
		expect(session.status).toBe("running");
	});

	it("defers the fake spawn while the pty is held", () => {
		const calls: FakeHarnessCalls = { interactive: [], oneShot: [] };
		state.adapter = fakeHarnessMock(calls);

		const session = createSession("8", { cwd: "/repo", holdPty: true });

		expect(session.pty).toBeNull();
		expect(calls.interactive).toEqual([]);
		session.pendingStart?.();
		expect(calls.interactive).toHaveLength(1);
	});
});
