import MenuList from "@mui/material/MenuList";
import { RepoMenuItem } from "./RepoMenuItem";

export function RepoMenuList({
	repos,
	selected,
	highlight,
	onHighlight,
	onSelect,
}: {
	repos: string[];
	selected: string;
	highlight: number;
	onHighlight: (index: number) => void;
	onSelect: (cwd: string) => void;
}) {
	return (
		<MenuList dense>
			{repos.map((cwd, index) => (
				<RepoMenuItem
					key={cwd}
					cwd={cwd}
					selected={cwd === selected}
					highlighted={index === highlight}
					onHover={() => onHighlight(index)}
					onSelect={() => onSelect(cwd)}
				/>
			))}
		</MenuList>
	);
}
