import { DropdownWrapper } from "./DropdownWrapper";
import { RepoList, repoName } from "./RepoList";

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
		<DropdownWrapper label={selected ? repoName(selected) : "Select repo..."}>
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
