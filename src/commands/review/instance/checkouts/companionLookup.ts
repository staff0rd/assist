import { execFileSync } from "node:child_process";
import { getPreferredRemoteRepo } from "../../../prs/getPreferredRemoteRepo";
import { ghPrView } from "../../highLevel/ghPrView";
import type { CompanionLookup } from "./CompanionHead";

export const companionLookup: CompanionLookup = {
	remoteRepo: (repoRoot) => getPreferredRemoteRepo(repoRoot),
	prHead: (prNumber, repo) =>
		ghPrView<{ headRefOid: string }>(prNumber, repo, "headRefOid").headRefOid,
	remoteHead: (repoRoot) =>
		execFileSync("git", ["ls-remote", "--symref", "origin", "HEAD"], {
			cwd: repoRoot,
			encoding: "utf8",
		}),
};
