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
				setter="assist config set next.repos owner/api,owner/web -g --repo"
				showSetter={!scope.repos}
			/>
		</Stack>
	);
}
