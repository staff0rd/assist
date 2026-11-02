import { describe, expect, it, vi } from "vitest";
import { createAssistSession } from "./createAssistSession";

vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ fake: "pty" })) }));

describe("createAssistSession", () => {
	it("creates the session with Auto start on when meta asks for it", () => {
		const session = createAssistSession("1", ["draft", "--once"], "/git/app", {
			autoApprove: true,
		});

		expect(session.autoApprove).toBe(true);
	});

	it("leaves Auto start off by default", () => {
		const session = createAssistSession("1", ["draft", "--once"], "/git/app");

		expect(session.autoApprove).toBeUndefined();
	});
});
