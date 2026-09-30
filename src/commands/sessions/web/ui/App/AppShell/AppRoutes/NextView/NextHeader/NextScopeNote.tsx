import Stack from "@mui/material/Stack";
import type { NextBoard, NextScope } from "../../../../../../next/types";
import { NextProjectLinks } from "./NextScopeNote/NextProjectLinks";
import { NextScopeLine } from "./NextScopeNote/NextScopeLine";

function repoValue(configured: string[] | null, selfRepo: string | null) {
	if (configured) return configured.join(", ");
	return selfRepo ? `${selfRepo} (this repo, by default)` : null;
}

function projectsValue(scope: NextScope, boards: NextBoard[]) {
	if (scope.projects.length === 0) return null;
	return (
		<>
			<NextProjectLinks projects={scope.projects} boards={boards} />
			{pickupFilterText(scope)}
		</>
	);
}

function pickupFilterText(scope: NextScope) {
	const excluded = [
		scope.excludeLabels.length > 0 &&
			`labels ${scope.excludeLabels.join(", ")}`,
		scope.excludeTypes.length > 0 && `types ${scope.excludeTypes.join(", ")}`,
	].filter(Boolean);
	const excluding =
		excluded.length > 0 ? `, excluding ${excluded.join("; ")}` : "";
	return `, picking up ${scope.pickStatuses.join(", ")}${excluding}`;
}

export function NextScopeNote({
	scope,
	boards,
}: {
	scope: NextScope;
	boards: NextBoard[];
}) {
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
				value={projectsValue(scope, boards)}
				unset="none — no project items are suggested"
				setter="assist config set next.projects my-org/3,my-org/5 -g --repo"
				showSetter={scope.projects.length === 0}
			/>
		</Stack>
	);
}
