import { docker } from "./docker";

export async function dockerReachable(): Promise<boolean> {
	try {
		await docker(["info", "--format", "{{.ServerVersion}}"], 10_000);
		return true;
	} catch {
		return false;
	}
}
