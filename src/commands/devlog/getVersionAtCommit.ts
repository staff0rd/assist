import { execSync } from "node:child_process";

export function getVersionAtCommit(hash: string): string | null {
	try {
		const content = execSync(`git show ${hash}:package.json`, {
			encoding: "utf8",
		});
		const pkg = JSON.parse(content);
		return pkg.version ?? null;
	} catch {
		return null;
	}
}
