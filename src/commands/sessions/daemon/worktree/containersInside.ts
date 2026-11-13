import { sep } from "node:path";
import { docker } from "./docker";

export type InspectedContainer = {
	Id: string;
	Name?: string;
	Mounts?: { Type?: string; Source?: string }[];
	HostConfig?: { Binds?: string[] | null; Mounts?: { Source?: string }[] };
	Config?: { Labels?: Record<string, string> | null };
};

const COMPOSE_WORKING_DIR = "com.docker.compose.project.working_dir";

export async function containersInside(
	worktreePath: string,
): Promise<InspectedContainer[]> {
	const ids = (await docker(["ps", "-aq", "--no-trunc"]))
		.split("\n")
		.map((id) => id.trim())
		.filter(Boolean);
	if (ids.length === 0) return [];
	const inspected = JSON.parse(
		await docker(["inspect", ...ids]),
	) as InspectedContainer[];
	return inspected.filter((c) =>
		sources(c).some((source) => inside(source, worktreePath)),
	);
}

function sources(container: InspectedContainer): string[] {
	return [
		...(container.Mounts ?? [])
			.filter((m) => m.Type === "bind")
			.map((m) => m.Source),
		...(container.HostConfig?.Binds ?? []).map((b) => b.split(":")[0]),
		...(container.HostConfig?.Mounts ?? []).map((m) => m.Source),
		container.Config?.Labels?.[COMPOSE_WORKING_DIR],
	].filter((s): s is string => Boolean(s));
}

function inside(source: string, worktreePath: string): boolean {
	return (
		source === worktreePath ||
		source.startsWith(`${worktreePath}/`) ||
		source.startsWith(`${worktreePath}${sep}`)
	);
}
