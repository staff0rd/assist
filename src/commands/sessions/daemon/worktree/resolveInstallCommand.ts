import { detectInstallCommand } from "./detectInstallCommand";

export function resolveInstallCommand(
	repoRoot: string,
	install: boolean | string,
): string | null {
	if (install === false) return null;
	if (typeof install === "string") return install;
	return detectInstallCommand(repoRoot);
}
