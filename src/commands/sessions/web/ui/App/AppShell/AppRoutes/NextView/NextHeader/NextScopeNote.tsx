import type { NextBoard, NextScope } from "../../../../../../next/types";
import { InlineScopeLines } from "./NextScopeNote/InlineScopeLines";
import { NextScopeLine } from "./NextScopeNote/NextScopeLine";
import { projectsValue } from "./NextScopeNote/projectsValue";

function repoValue(configured: string[] | null, selfRepo: string | null) {
	if (configured) return configured.join(", ");
	return selfRepo ? `${selfRepo} (this repo, by default)` : null;
}

export function NextScopeNote({
	scope,
	boards,
}: {
	scope: NextScope;
	boards: NextBoard[];
}) {
	const lines = [
		<NextScopeLine
			key="peers"
			label="Peers"
			value={scope.peers.length > 0 ? scope.peers.join(", ") : null}
			unset="none — only PRs requesting your review appear"
			setter="assist config set next.peers alice,bob --repo"
			showSetter={scope.peers.length === 0}
		/>,
		<NextScopeLine
			key="repos"
			label="Repos"
			value={repoValue(scope.repos, scope.selfRepo)}
			unset="none"
			setter="assist config set next.repos my-org,other/web --repo"
			showSetter={!scope.repos}
		/>,
		<NextScopeLine
			key="projects"
			label="Projects"
			value={projectsValue(scope, boards)}
			unset="none — no project items are suggested"
			setter="assist config set next.projects my-org/3,my-org/5 --repo"
			showSetter={scope.projects.length === 0}
		/>,
	];
	return <InlineScopeLines lines={lines} />;
}
