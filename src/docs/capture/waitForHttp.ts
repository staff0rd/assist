import { readFileSync } from "node:fs";

export async function waitForHttp(
	url: string,
	log: string,
	{ label, timeoutMs }: { label: string; timeoutMs: number },
): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			if ((await fetch(url)).ok) return;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(
		`${label} did not answer ${url} within ${timeoutMs / 1000}s:\n${readFileSync(log, "utf8")}`,
	);
}
