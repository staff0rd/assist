import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import { handleTypeKeys } from "./handleTypeKeys";
import { handleTypePrompt } from "./handleTypePrompt";
import type { SessionManager } from "./SessionManager";

vi.mock("./broadcast", () => ({ sendTo: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const client = {} as SessionClient;
const senders: Record<string, { id: string; agent?: string }> = {
	"2": { id: "2", agent: "yoke-2-e6" },
	"5": { id: "5" },
};

function manager() {
	const io = {
		sender: vi.fn((id: string) => senders[id]),
		typePrompt: vi.fn(() => ({ ok: true, message: "Sent" })),
		typeKeys: vi.fn(() => ({ ok: true, message: "Sent keys" })),
	};
	const links = {
		localNode: () => "wsl",
		nodes: () => ({ links: [{ name: "win", state: "connected" }] }),
		route: vi.fn(),
	};
	return { io, links, m: { io, links } as unknown as SessionManager };
}

let fake: ReturnType<typeof manager>;
beforeEach(() => {
	fake = manager();
});

describe("handleTypePrompt", () => {
	it("wraps the text in a tag naming the sending session and its agent", () => {
		handleTypePrompt(client, fake.m, {
			type: "type-prompt",
			sessionId: "11",
			text: "run hash -r",
			fromSessionId: "2",
		});
		expect(fake.io.typePrompt).toHaveBeenCalledWith(
			"11",
			'<session-message from="2" agent="yoke-2-e6">run hash -r</session-message>',
		);
	});

	it("omits the agent when the sender has no agent name", () => {
		handleTypePrompt(client, fake.m, {
			type: "type-prompt",
			sessionId: "11",
			text: "hi",
			fromSessionId: "5",
		});
		expect(fake.io.typePrompt).toHaveBeenCalledWith(
			"11",
			'<session-message from="5">hi</session-message>',
		);
	});

	it("leaves the text unwrapped when no sender is given", () => {
		handleTypePrompt(client, fake.m, {
			type: "type-prompt",
			sessionId: "11",
			text: "hi",
		});
		expect(fake.io.typePrompt).toHaveBeenCalledWith("11", "hi");
	});

	it("leaves the text unwrapped when the sender is unknown", () => {
		handleTypePrompt(client, fake.m, {
			type: "type-prompt",
			sessionId: "11",
			text: "hi",
			fromSessionId: "99",
		});
		expect(fake.io.typePrompt).toHaveBeenCalledWith("11", "hi");
	});

	it("names the sender as <node>:<id> when routing to a linked node", () => {
		handleTypePrompt(client, fake.m, {
			type: "type-prompt",
			sessionId: "win:3",
			text: "hi",
			fromSessionId: "2",
			requestId: "r1",
		});
		expect(fake.links.route).toHaveBeenCalledWith(client, {
			type: "type-prompt",
			sessionId: "win:3",
			text: '<session-message from="wsl:2" agent="yoke-2-e6">hi</session-message>',
			requestId: "r1",
		});
	});
});

describe("handleTypeKeys", () => {
	it("never wraps raw keystrokes", () => {
		handleTypeKeys(client, fake.m, {
			type: "type-keys",
			sessionId: "11",
			text: "y",
			fromSessionId: "2",
		});
		expect(fake.io.typeKeys).toHaveBeenCalledWith("11", "y");
	});
});
