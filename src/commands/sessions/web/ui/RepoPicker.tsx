import { useState } from "react";
import { CustomPathInput } from "./CustomPathInput";
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
	const [customMode, setCustomMode] = useState(false);

	if (customMode) {
		return (
			<CustomPathInput
				onConfirm={(p) => {
					onSelect(p);
					setCustomMode(false);
				}}
				onCancel={() => setCustomMode(false)}
			/>
		);
	}

	return (
		<DropdownWrapper label={selected ? repoName(selected) : "Select repo..."}>
			{(close) => (
				<RepoList
					repos={repos}
					selected={selected}
					onSelect={onSelect}
					onCustom={() => setCustomMode(true)}
					close={close}
				/>
			)}
		</DropdownWrapper>
	);
}
