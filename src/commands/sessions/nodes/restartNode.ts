import { linkStatus } from "./awaitLinkReturn";
import { postToPeer } from "./postToPeer";
import { startPeerAction } from "./startPeerAction";

const TARGETS = ["daemon", "webserver", "both"];
const REQUEST_TIMEOUT_MS = 30_000;

export async function restartNode(
	name: string,
	options: { target: string },
): Promise<void> {
	const { target } = options;
	if (!TARGETS.includes(target))
		throw new Error(
			`--target must be one of ${TARGETS.join(", ")}, got ${target}`,
		);
	const action = startPeerAction(name, `restart ${target}`);
	const before = await linkStatus(name);
	try {
		await postToPeer(
			action.spec.url,
			`/api/restart?target=${target}`,
			action.traceId,
			REQUEST_TIMEOUT_MS,
		);
	} catch (error) {
		throw await action.fail(`Restart ${name} failed`, error);
	}
	console.log(`Waiting for ${name}'s link to reconnect…`);
	const link = await action.awaitReturn(before?.state !== "connected");
	console.log(`${name} is back (v${link.peerVersion ?? "unknown"})`);
}
