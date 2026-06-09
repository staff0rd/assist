import MenuItem from "@mui/material/MenuItem";
import { useEffect, useRef } from "react";
import { repoName } from "./RepoList";

export function RepoMenuItem({
	cwd,
	selected,
	highlighted,
	onHover,
	onSelect,
}: {
	cwd: string;
	selected: boolean;
	highlighted: boolean;
	onHover: () => void;
	onSelect: () => void;
}) {
	const ref = useRef<HTMLLIElement>(null);

	useEffect(() => {
		if (highlighted) ref.current?.scrollIntoView({ block: "nearest" });
	}, [highlighted]);

	return (
		<MenuItem
			ref={ref}
			selected={selected}
			title={cwd}
			onClick={onSelect}
			onMouseEnter={onHover}
			sx={{
				fontSize: 12,
				...(highlighted && { bgcolor: "action.hover" }),
			}}
		>
			{repoName(cwd)}
		</MenuItem>
	);
}
