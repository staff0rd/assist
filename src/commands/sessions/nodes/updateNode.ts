import { requestSession } from "../shared/requestSession";
import { linkStatus } from "./awaitLinkReturn";
import { postToPeer } from "./postToPeer";
import { type PeerAction, startPeerAction } from "./startPeerAction";

const CREATE_TIMEOUT_MS = 30_000;
const UPDATE_TIMEOUT_MS = 10 * 60_000;
const RESTART_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number, what: string) {
	return Promise.race([
		promise,
		new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error(`${what} timed out`)), ms).unref(),
		),
	]);
}

async function updateOverLink(name: string, action: PeerAction) {
	try {
		const sessionId = await withTimeout(
			requestSession({
				type: "create-assist",
				assistArgs: ["update"],
				node: name,
			}),
			CREATE_TIMEOUT_MS,
			"create-assist",
		);
		console.log(`Running assist update on ${name} (session ${sessionId})…`);
	} catch (error) {
		throw await action.fail(`Update ${name} failed`, error);
	}
	await action.awaitReturn(false, UPDATE_TIMEOUT_MS);
	console.log(`Restarting ${name}'s web server…`);
	try {
		await postToPeer(
			action.spec.url,
			"/api/restart?target=webserver",
			action.traceId,
			RESTART_TIMEOUT_MS,
		);
	} catch (error) {
		throw await action.fail(`Restart ${name}'s web server failed`, error);
	}
	return action.awaitReturn(false);
}

async function selfUpdate(name: string, action: PeerAction) {
	console.log(`Link to ${name} is not connected; using its /api/self-update…`);
	try {
		await postToPeer(
			action.spec.url,
			"/api/self-update",
			action.traceId,
			UPDATE_TIMEOUT_MS,
		);
	} catch (error) {
		throw await action.fail(`Update ${name} failed`, error);
	}
	return action.awaitReturn(true);
}

export async function updateNode(name: string): Promise<void> {
	const action = startPeerAction(name, "update");
	const connected = (await linkStatus(name))?.state === "connected";
	const link = connected
		? await updateOverLink(name, action)
		: await selfUpdate(name, action);
	console.log(`${name} updated to v${link.peerVersion ?? "unknown"}`);
}
