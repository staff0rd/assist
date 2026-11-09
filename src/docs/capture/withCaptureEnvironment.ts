import { rmSync } from "node:fs";
import { runAssist } from "./runAssist";
import { type CaptureHome, createCaptureHome } from "./createCaptureHome";
import { startCapturePostgres } from "./startCapturePostgres";
import { startCaptureServer } from "./startCaptureServer";
import { startFakeAppStoreConnect } from "./startFakeAppStoreConnect";

type CaptureEnvironment = { capture: CaptureHome; url: string };

export async function withCaptureEnvironment(
	keepHome: boolean,
	run: (environment: CaptureEnvironment) => Promise<void>,
): Promise<void> {
	const postgres = await startCapturePostgres();
	let capture: CaptureHome | undefined;
	try {
		capture = createCaptureHome(postgres.url);
		console.log(`Capturing in isolated HOME ${capture.home}`);
		runAssist(capture, ["db", "migrate"]);
		const home = capture;
		const asc = await startFakeAppStoreConnect(() => home.testflight);
		capture.env.ASSIST_ASC_BASE_URL = asc.url;
		try {
			const server = await startCaptureServer(capture);
			try {
				await run({ capture, url: server.url });
			} finally {
				for (const peer of capture.peers.values()) await peer.stop();
				capture.feedServer?.close();
				await server.stop();
			}
		} finally {
			asc.server.close();
		}
	} finally {
		postgres.stop();
		const homes = capture
			? [capture, ...[...capture.peers.values()].map((p) => p.capture)]
			: [];
		for (const { home } of homes)
			if (keepHome) console.log(`Kept ${home}`);
			else rmSync(home, { recursive: true, force: true });
	}
}
