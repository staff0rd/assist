import type { ChildProcess } from "node:child_process";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";
import { daemonLog } from "../daemonLog";
import type { SshTarget } from "./LinkStatus";
import type { LinkTunnel } from "./LinkTunnel";
import { killOrphanOnDaemonExit } from "./killOrphanOnDaemonExit";
import { sshTunnelArgs } from "./sshTunnelArgs";
import { defaultSshTunnelIo, type SshTunnelIo } from "./SshTunnelIo";

export class SshTunnel implements LinkTunnel {
	private child?: ChildProcess;
	private exitReason = "";
	private lastStderr = "";

	constructor(
		private readonly name: string,
		private readonly target: SshTarget,
		private readonly io: SshTunnelIo = defaultSshTunnelIo,
	) {}

	async ready(): Promise<void> {
		if (!this.child) this.start();
		await this.waitBound(this.child);
	}

	dispose(): void {
		const child = this.child;
		this.child = undefined;
		if (!child) return;
		daemonLog(`link ${this.name} tunnel: stopping ssh`);
		child.kill();
	}

	private start(): void {
		const args = sshTunnelArgs(this.target);
		daemonLog(`link ${this.name} tunnel: spawning ssh ${args.join(" ")}`);
		const child = this.io.spawn(args);
		this.child = child;
		this.lastStderr = "";
		killOrphanOnDaemonExit(child);
		if (child.stderr)
			createInterface({ input: child.stderr }).on("line", (line) => {
				this.lastStderr = line;
				daemonLog(`link ${this.name} ssh: ${line}`);
			});
		child.once("error", (error) => this.onExit(child, error.message));
		child.once("exit", (code, signal) =>
			this.onExit(child, signal ? `signal ${signal}` : `code ${code}`),
		);
	}

	private onExit(child: ChildProcess, reason: string): void {
		if (this.child !== child) return;
		this.child = undefined;
		this.exitReason = this.lastStderr
			? `${reason}: ${this.lastStderr}`
			: reason;
		daemonLog(`link ${this.name} tunnel: ssh exited (${this.exitReason})`);
	}

	private async waitBound(child: ChildProcess | undefined): Promise<void> {
		const { alias, localPort } = this.target;
		const deadline = Date.now() + this.io.bindTimeoutMs;
		while (Date.now() < deadline) {
			if (this.child !== child)
				throw new Error(`ssh tunnel to ${alias} exited (${this.exitReason})`);
			if (await this.io.accepts(localPort)) return;
			await delay(this.io.pollMs);
		}
		this.dispose();
		throw new Error(
			`ssh tunnel to ${alias} did not bind 127.0.0.1:${localPort} within ${this.io.bindTimeoutMs / 1000}s`,
		);
	}
}
