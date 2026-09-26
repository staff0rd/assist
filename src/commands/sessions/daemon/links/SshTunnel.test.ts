import type { ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { daemonLog } from "../daemonLog";
import { SshTunnel } from "./SshTunnel";
import type { SshTunnelIo } from "./SshTunnelIo";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

const TARGET = { alias: "pc", port: 3101, localPort: 43101 };

function fakeChild() {
	const child = Object.assign(new EventEmitter(), {
		stderr: new PassThrough(),
		kill: vi.fn(),
	});
	return child;
}

function io(overrides: Partial<SshTunnelIo> = {}) {
	const children: ReturnType<typeof fakeChild>[] = [];
	const spawn = vi.fn((_args: string[]) => {
		const child = fakeChild();
		children.push(child);
		return child as unknown as ChildProcess;
	});
	return {
		children,
		spawn,
		io: {
			spawn,
			accepts: async () => true,
			bindTimeoutMs: 100,
			pollMs: 5,
			...overrides,
		} satisfies SshTunnelIo,
	};
}

describe("SshTunnel", () => {
	it("forwards the local port to the peer's loopback port through the alias", async () => {
		const fake = io();
		await new SshTunnel("pc-windows", TARGET, fake.io).ready();
		expect(fake.spawn).toHaveBeenCalledWith(
			expect.arrayContaining(["-N", "-L", "43101:127.0.0.1:3101", "pc"]),
		);
		expect(fake.spawn.mock.calls[0][0]).toContain("BatchMode=yes");
	});

	it("reuses a live ssh and respawns after it exits", async () => {
		const fake = io();
		const tunnel = new SshTunnel("pc-windows", TARGET, fake.io);
		await tunnel.ready();
		await tunnel.ready();
		expect(fake.spawn).toHaveBeenCalledOnce();

		fake.children[0].emit("exit", 255, null);
		await tunnel.ready();

		expect(fake.spawn).toHaveBeenCalledTimes(2);
	});

	it("rejects with ssh's last stderr line and logs it tagged by link", async () => {
		const fake = io({ accepts: async () => false });
		const ready = new SshTunnel("pc-windows", TARGET, fake.io).ready();
		const child = fake.children[0];
		child.stderr.write("ssh: connect to host pc port 22: Connection refused\n");
		await new Promise((resolve) => setTimeout(resolve, 5));
		child.emit("exit", 255, null);

		await expect(ready).rejects.toThrow(
			"ssh tunnel to pc exited (code 255: ssh: connect to host pc port 22: Connection refused)",
		);
		expect(daemonLog).toHaveBeenCalledWith(
			"link pc-windows ssh: ssh: connect to host pc port 22: Connection refused",
		);
	});

	it("kills ssh and rejects when the port never binds", async () => {
		const fake = io({ accepts: async () => false });
		await expect(
			new SshTunnel("pc-windows", TARGET, fake.io).ready(),
		).rejects.toThrow("did not bind 127.0.0.1:43101");
		expect(fake.children[0].kill).toHaveBeenCalled();
	});

	it("stops ssh on dispose", async () => {
		const fake = io();
		const tunnel = new SshTunnel("pc-windows", TARGET, fake.io);
		await tunnel.ready();
		tunnel.dispose();
		expect(fake.children[0].kill).toHaveBeenCalled();
	});
});
