import { type CaptureHome, createCaptureHome } from "./createCaptureHome";
import { runAssist } from "./runAssist";
import { startCaptureServer } from "./startCaptureServer";

async function ensurePeer(capture: CaptureHome, name: string) {
	const existing = capture.peers.get(name);
	if (existing) return existing;
	const peerHome = createCaptureHome(capture.databaseUrl);
	runAssist(peerHome, ["config", "set", "sessions.nodeName", name, "--node"]);
	const server = await startCaptureServer(peerHome);
	const peer = { capture: peerHome, ...server };
	capture.peers.set(name, peer);
	return peer;
}

export async function linkPeer(
	capture: CaptureHome,
	name: string,
): Promise<void> {
	const peer = await ensurePeer(capture, name);
	runAssist(capture, ["sessions", "nodes", "link", name, peer.url]);
	capture.linkedPeers.add(name);
}
