import { setTimeout as sleep } from "node:timers/promises";
import { requestBrowser } from "./requestBrowser";

type Options = {
	timeoutMs?: number;
	pollMs?: number;
	now?: () => number;
	connectedVersion?: (server: string) => Promise<string | undefined>;
	wait?: (ms: number) => Promise<unknown>;
};

const connectedVersion = (server: string) =>
	requestBrowser(server, { op: "status" })
		.then((reply) => reply.version)
		.catch(() => undefined);

export async function waitForNewVersion(
	server: string,
	oldVersion: string,
	{
		timeoutMs = 90_000,
		pollMs = 2_000,
		now = Date.now,
		connectedVersion: probe = connectedVersion,
		wait = sleep,
	}: Options = {},
): Promise<string | undefined> {
	const deadline = now() + timeoutMs;
	while (now() < deadline) {
		await wait(pollMs);
		const version = await probe(server);
		if (version && version !== oldVersion) return version;
	}
	return undefined;
}
