import { parseAzureDevopsPrUrl } from "../../../../shared/azureDevops/parseAzureDevopsPrUrl";
import { azureDevopsNotCloned } from "./azureDevopsNotCloned";
import { findAzureDevopsClone } from "./findAzureDevopsClone";
import { resolveGithubClone } from "./resolveGithubClone";

export function resolveSessionClone(
	url: unknown,
	baseDir: string,
	redirects?: Record<string, string>,
): ReturnType<typeof resolveGithubClone> {
	const trimmed = typeof url === "string" ? url.trim() : "";
	const azurePr = parseAzureDevopsPrUrl(trimmed);
	if (!azurePr) return resolveGithubClone(url, baseDir, redirects);
	const cwd = findAzureDevopsClone(azurePr, baseDir);
	if (!cwd) return azureDevopsNotCloned(azurePr, baseDir);
	return { ok: true, url: trimmed, cwd };
}
