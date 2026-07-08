import { execSync } from "node:child_process";
import type { GitRef } from "../backlog/types";

export function readSessionPrRef(): GitRef | null {
	try {
		const branch = execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		if (!branch || branch === "HEAD") return null;
		const pr = JSON.parse(
			execSync(`gh pr view ${branch} --json number,title,url,state`, {
				encoding: "utf8",
				stdio: ["pipe", "pipe", "pipe"],
			}),
		);
		if (typeof pr.number !== "number") return null;
		const ref: GitRef = { kind: "pr", ref: String(pr.number) };
		if (pr.title) ref.title = pr.title;
		if (pr.url) ref.url = pr.url;
		if (pr.state) ref.state = pr.state;
		return ref;
	} catch {
		return null;
	}
}
