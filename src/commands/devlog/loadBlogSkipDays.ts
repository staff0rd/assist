import { homedir } from "node:os";
import { join } from "node:path";
import { loadRawYaml } from "../../shared/loadRawYaml";

export const BLOG_REPO_ROOT = join(homedir(), "git/blog");

export function loadBlogSkipDays(repoName: string): Set<string> {
	const config = loadRawYaml(join(BLOG_REPO_ROOT, "assist.yml"));
	const devlog = config.devlog as Record<string, unknown> | undefined;
	const skip = devlog?.skip as Record<string, string[]> | undefined;
	return new Set(skip?.[repoName] ?? []);
}
