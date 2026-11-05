import { apiFetch } from "../../../apiFetch";

export async function fetchServerIdentity(): Promise<string | undefined> {
	try {
		const res = await apiFetch("/api/health", {
			cache: "no-store",
			capture: false,
		});
		if (!res.ok) return undefined;
		const body = (await res.json()) as {
			version?: string;
			startCommit?: string;
		};
		return `${body.version ?? ""}@${body.startCommit ?? ""}`;
	} catch {
		return undefined;
	}
}
