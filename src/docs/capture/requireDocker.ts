import { spawnSync } from "node:child_process";

export function requireDocker(): void {
	const probe = spawnSync("docker", ["info"], { stdio: "ignore" });
	if (probe.status === 0) return;
	console.error(
		"Docker is not reachable ('docker info' failed); docs capture needs it for a throwaway Postgres container. Start Docker (on WSL, enable this distro under Docker Desktop → Settings → Resources → WSL integration) and re-run.",
	);
	process.exit(1);
}
