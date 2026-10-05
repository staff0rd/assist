import {
	ASSIST_VERSION,
	helloCompatible,
	helloMismatchKind,
	isHello,
	PROTOCOL_VERSION,
} from "../buildHello";
import { daemonLog } from "../daemonLog";
import { linkVersionCheck } from "./linkVersionCheck";

type PeerVersion = { version: string; protocol?: number };

type HelloVerdict =
	| { kind: "accept"; peer: PeerVersion }
	| { kind: "heal"; peer: PeerVersion }
	| { kind: "reject"; reason: string; peer?: PeerVersion };

const helloFields = new Set([
	"type",
	"version",
	"protocol",
	"nodeName",
	"peer",
]);

function unrecognisedHelloFields(msg: Record<string, unknown>): string {
	const extra = Object.keys(msg).filter((key) => !helloFields.has(key));
	return extra.length
		? `; ignoring unrecognised fields ${extra.join(",")}`
		: "";
}

export function acceptPeerHello(
	linkName: string,
	msg: Record<string, unknown>,
): HelloVerdict {
	if (!isHello(msg)) return { kind: "reject", reason: "malformed hello" };
	const peer = { version: msg.version, protocol: msg.protocol };
	if (msg.nodeName && msg.nodeName !== linkName)
		return {
			kind: "reject",
			reason: `peer reports nodeName ${msg.nodeName}, link expects ${linkName}`,
			peer,
		};
	if (helloCompatible(msg)) {
		daemonLog(
			`link ${linkName} ws: hello ok (${msg.version})${unrecognisedHelloFields(msg)}`,
		);
		return { kind: "accept", peer };
	}
	const mode = linkVersionCheck();
	const detail = `${helloMismatchKind(msg)} mismatch: peer protocol ${msg.protocol ?? "legacy"} version ${msg.version} (this node protocol ${PROTOCOL_VERSION} version ${ASSIST_VERSION})`;
	if (mode !== "block") {
		daemonLog(
			`link ${linkName} ws: ${detail}; proceeding (sessions.linkVersionCheck=${mode})`,
		);
		return { kind: "accept", peer };
	}
	daemonLog(`link ${linkName} ws: ${detail}`);
	return { kind: "heal", peer };
}
