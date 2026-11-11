import { execFile } from "node:child_process";
import { linkItemState, type LinkItem } from "./linkItemState";
import { linkStatusQuery } from "./linkStatusQuery";
import type { LinkRef, LinkState } from "./LinkState";

type LinkStatusResponse = {
	data?: Record<string, { issueOrPullRequest?: LinkItem | null } | null>;
};

function runGraphql(input: string): Promise<LinkStatusResponse> {
	return new Promise((resolve, reject) => {
		const child = execFile(
			"gh",
			["api", "graphql", "--input", "-"],
			{ encoding: "utf8", windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
			(error, stdout, stderr) => {
				try {
					const parsed = JSON.parse(stdout) as LinkStatusResponse;
					if (parsed.data) return resolve(parsed);
				} catch {}
				reject(error ?? new Error(stderr || "gh api graphql returned no data"));
			},
		);
		child.stdin?.end(input);
	});
}

export async function queryLinkStates(
	refs: LinkRef[],
): Promise<(LinkState | null)[]> {
	const response = await runGraphql(JSON.stringify(linkStatusQuery(refs)));
	return refs.map((_, i) =>
		linkItemState(response.data?.[`i${i}`]?.issueOrPullRequest),
	);
}
