import { DropdownWrapper } from "./DropdownWrapper";
import { isWindowsCwd } from "./isWindowsCwd";
import { RepoList, repoName } from "./RepoList";
import { WindowsBadge } from "./WindowsBadge";

function selectedLabel(selected: string) {
	if (!selected) return "Select repo...";
	if (!isWindowsCwd(selected)) return repoName(selected);
	return (
		<span
			style={{
				display: "flex",
				flexGrow: 1,
				alignItems: "center",
				justifyContent: "space-between",
				gap: 6,
				minWidth: 0,
			}}
		>
			{repoName(selected)}
			<WindowsBadge />
		</span>
	);
}

export function RepoPicker({
	repos,
	selected,
	onSelect,
}: {
	repos: string[];
	selected: string;
	onSelect: (cwd: string) => void;
}) {
	return (
		<DropdownWrapper label={selectedLabel(selected)}>
			{(close) => (
				<RepoList
					repos={repos}
					selected={selected}
					onSelect={onSelect}
					close={close}
				/>
			)}
		</DropdownWrapper>
	);
}
