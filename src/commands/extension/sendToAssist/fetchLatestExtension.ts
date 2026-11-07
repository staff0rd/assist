import { assistServerUrl } from "./assistServerUrl";

const UPDATES_TIMEOUT_MS = 5_000;

type LatestExtension = { version: string; installLink?: string };

export async function fetchLatestExtension(): Promise<
	LatestExtension | undefined
> {
	try {
		const response = await fetch(`${await assistServerUrl()}/api/updates`, {
			signal: AbortSignal.timeout(UPDATES_TIMEOUT_MS),
		});
		if (!response.ok) return undefined;
		const body = (await response.json()) as {
			extension?: { latest?: unknown; installLink?: unknown };
		};
		const latest = body.extension?.latest;
		if (typeof latest !== "string") return undefined;
		const installLink = body.extension?.installLink;
		return {
			version: latest,
			installLink: typeof installLink === "string" ? installLink : undefined,
		};
	} catch {
		return undefined;
	}
}
