import { getInstallDir } from "../shared/getInstallDir";
import { isBuildInFlight } from "./isBuildInFlight";

type WaitForBuildDeps = {
	installDir?: string;
	timeoutMs?: number;
	pollMs?: number;
	log?: (message: string) => void;
};

const TIMEOUT_MS = 180_000;
const POLL_MS = 250;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForBuild(deps: WaitForBuildDeps = {}): Promise<void> {
	const {
		installDir = getInstallDir(),
		timeoutMs = TIMEOUT_MS,
		pollMs = POLL_MS,
		log = console.log,
	} = deps;
	if (!isBuildInFlight(installDir)) return;
	log(`waiting for the in-flight build in ${installDir} to finish`);
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		await delay(pollMs);
		if (!isBuildInFlight(installDir)) {
			log("build finished; continuing");
			return;
		}
	}
	log(`build still running after ${timeoutMs / 1000}s; continuing anyway`);
}
