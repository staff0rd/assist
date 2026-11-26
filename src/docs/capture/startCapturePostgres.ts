import { execFileSync, spawnSync } from "node:child_process";
import { findFreePort } from "../../shared/findFreePort";

const IMAGE = "postgres:17-alpine";
const READY_TIMEOUT_MS = 60_000;

type CapturePostgres = { url: string; stop: () => void };

async function waitUntilReady(container: string): Promise<void> {
	const deadline = Date.now() + READY_TIMEOUT_MS;
	while (Date.now() < deadline) {
		const probe = spawnSync("docker", [
			"exec",
			container,
			"pg_isready",
			"-U",
			"postgres",
			"-h",
			"127.0.0.1",
		]);
		if (probe.status === 0) return;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error(`Postgres container ${container} did not become ready`);
}

export async function startCapturePostgres(): Promise<CapturePostgres> {
	const port = await findFreePort();
	const container = execFileSync(
		"docker",
		[
			"run",
			"--detach",
			"--rm",
			"--env",
			"POSTGRES_PASSWORD=sandbox",
			"--publish",
			`127.0.0.1:${port}:5432`,
			IMAGE,
		],
		{ encoding: "utf8" },
	).trim();
	const stop = () => {
		spawnSync("docker", ["rm", "--force", container], { stdio: "ignore" });
	};
	try {
		await waitUntilReady(container);
	} catch (error) {
		stop();
		throw error;
	}
	return {
		url: `postgresql://postgres:sandbox@127.0.0.1:${port}/postgres`,
		stop,
	};
}
