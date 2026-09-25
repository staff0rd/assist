const POLL_INTERVAL_MS = 300;
const REQUIRED_OK_POLLS = 2;
const PROBE_URL = "/api/session-layout";

async function serverAnswers(): Promise<boolean> {
	try {
		const res = await fetch(PROBE_URL, { cache: "no-store" });
		return res.ok;
	} catch {
		return false;
	}
}

export async function waitForServerToAnswer(
	abandoned: () => boolean,
): Promise<boolean> {
	let consecutiveOk = 0;
	while (!abandoned()) {
		consecutiveOk = (await serverAnswers()) ? consecutiveOk + 1 : 0;
		if (consecutiveOk >= REQUIRED_OK_POLLS) return !abandoned();
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}
	return false;
}
