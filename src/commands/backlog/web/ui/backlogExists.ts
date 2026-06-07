import { withCwd } from "./withCwd";

export async function backlogExists(
	cwd?: string,
	signal?: AbortSignal,
): Promise<boolean> {
	const res = await fetch(withCwd("/api/backlog/exists", cwd), { signal });
	const body = (await res.json()) as { exists: boolean };
	return body.exists;
}
