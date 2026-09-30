import Stack from "@mui/material/Stack";
import type { NextScope } from "../../../../../../next/types";
import { NextScopeLine } from "./NextScopeNote/NextScopeLine";

function repoValue(configured: string[] | null, selfRepo: string | null) {
	if (configured) return configured.join(", ");
	return selfRepo ? `${selfRepo} (this repo, by default)` : null;
}

export function NextScopeNote({ scope }: { scope: NextScope }) {
	return (
		<Stack spacing={0.25}>
			<NextScopeLine
				label="Peers"
				value={scope.peers.length > 0 ? scope.peers.join(", ") : null}
				unset="none — only PRs requesting your review appear"
				setter="assist config set next.peers alice,bob -g --repo"
				showSetter={scope.peers.length === 0}
			/>
			<NextScopeLine
				label="Repos"
				value={repoValue(scope.repos, scope.selfRepo)}
				unset="none"
				setter="assist config set next.repos my-org,other/web -g --repo"
				showSetter={!scope.repos}
			/>
			<NextScopeLine
				label="Projects"
				value={
					scope.projects.length > 0
						? `${scope.projects.join(", ")}, picking up ${scope.pickStatuses.join(", ")}`
						: null
				}
				unset="none — no project items are suggested"
				setter="assist config set next.projects my-org/3,my-org/5 -g --repo"
				showSetter={scope.projects.length === 0}
			/>
		</Stack>
	);
}
