import type { LinkStatus, NodesMessage } from "../daemon/links/LinkStatus";
import { queryNodes } from "./queryNodes";

const POLL_MS = 1_000;

type AwaitDeps = {
	query?: () => Promise<NodesMessage | undefined>;
	sleep?: (ms: number) => Promise<void>;
	now?: () => number;
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function linkStatus(
	name: string,
	query: () => Promise<NodesMessage | undefined> = queryNodes,
): Promise<LinkStatus | undefined> {
	return (await query())?.links.find((l) => l.name === name);
}

export async function awaitLinkReturn(
	name: string,
	options: { sawDown: boolean; timeoutMs: number },
	deps: AwaitDeps = {},
): Promise<LinkStatus | undefined> {
	const { query = queryNodes, sleep = wait, now = Date.now } = deps;
	const deadline = now() + options.timeoutMs;
	let sawDown = options.sawDown;
	while (now() < deadline) {
		const link = await linkStatus(name, query);
		if (link?.state !== "connected") sawDown = true;
		else if (sawDown) return link;
		await sleep(POLL_MS);
	}
	return undefined;
}
