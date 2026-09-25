import MenuItem from "@mui/material/MenuItem";
import { isWindowsCwd } from "../../isWindowsCwd";
import { repoName } from "./RepoList";
import { useHighlightScroll } from "./useHighlightScroll";
import { WindowsBadge } from "../WindowsBadge";

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
	const ref = useHighlightScroll(highlighted);

	return (
		<MenuItem
			ref={ref}
			selected={selected}
			title={cwd}
			onClick={onSelect}
			onMouseEnter={onHover}
			sx={{
				fontSize: 12,
				display: "flex",
				justifyContent: "space-between",
				gap: 1,
				...(highlighted && { bgcolor: "action.hover" }),
			}}
		>
			{repoName(cwd)}
			{isWindowsCwd(cwd) && <WindowsBadge />}
		</MenuItem>
	);
}
