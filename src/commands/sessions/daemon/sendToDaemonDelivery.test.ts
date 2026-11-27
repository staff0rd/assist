import { mkdtempSync, rmSync } from "node:fs";
import * as net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type SessionClient, sendTo } from "./broadcast";
import { handleConnection } from "./handleConnection";
import type { SessionManager } from "./SessionManager";
import { sendToDaemon } from "./sendToDaemon";

const paths = vi.hoisted(() => ({ socket: "" }));

vi.mock("./daemonPaths", () => ({ daemonPaths: paths }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const LARGE_GREETING = { type: "sessions", padding: "x".repeat(4_000_000) };

function largeGreetingManager(dismissSession: () => void): SessionManager {
	return {
		addClient: vi.fn(),
		removeClient: vi.fn(),
		clients: {
			greet: (client: SessionClient) => sendTo(client, LARGE_GREETING),
		},
		links: { route: vi.fn(() => false) },
		dismissSession,
	} as unknown as SessionManager;
}

describe("sendToDaemon delivery", () => {
	let dir: string;
	let server: net.Server;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "assist-send-"));
		paths.socket = join(dir, "daemon.sock");
	});

	afterEach(async () => {
		await new Promise((resolve) => server.close(resolve));
		rmSync(dir, { recursive: true, force: true });
	});

	async function listen(manager: SessionManager): Promise<void> {
		server = net.createServer((socket) => handleConnection(socket, manager));
		await new Promise<void>((resolve) => server.listen(paths.socket, resolve));
	}

	it("delivers the message while the daemon writes a large greeting", async () => {
		const dismissSession = vi.fn();
		await listen(largeGreetingManager(dismissSession));

		await sendToDaemon({ type: "dismiss", sessionId: "99999" });

		expect(dismissSession).toHaveBeenCalledWith("99999", false);
	});

	it("rejects when the daemon handler fails", async () => {
		await listen(
			largeGreetingManager(() => {
				throw new Error("boom");
			}),
		);

		await expect(
			sendToDaemon({ type: "dismiss", sessionId: "99999" }),
		).rejects.toThrow("dismiss failed: boom");
	});
});
