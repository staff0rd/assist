import { describeProtocolGap, isHello, negotiateProtocol } from "../buildHello";
import { daemonLog } from "../daemonLog";
import { linkVersionCheck } from "./linkVersionCheck";

type PeerVersion = { version: string; protocol?: number };

type HelloVerdict =
	| { kind: "accept"; peer: PeerVersion; protocol?: number }
	| { kind: "block"; reason: string; peer: PeerVersion }
	| { kind: "reject"; reason: string; peer?: PeerVersion };

const helloFields = new Set([
	"type",
	"version",
	"protocol",
	"minProtocol",
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
	const protocol = negotiateProtocol(msg);
	if (protocol !== undefined) {
		daemonLog(
			`link ${linkName} ws: hello ok (${msg.version}, protocol ${protocol})${unrecognisedHelloFields(msg)}`,
		);
		return { kind: "accept", peer, protocol };
	}
	const mode = linkVersionCheck();
	const reason = describeProtocolGap(linkName, msg);
	if (mode !== "block") {
		daemonLog(
			`link ${linkName} ws: ${reason}; proceeding (sessions.linkVersionCheck=${mode})`,
		);
		return { kind: "accept", peer };
	}
	return { kind: "block", reason, peer };
}
