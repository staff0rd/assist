import type { SxProps, Theme } from "@mui/material";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import { dropdownStyleUp } from "./DropdownWrapper";

export function repoName(cwd: string): string {
	const sep = cwd.includes("\\") ? "\\" : "/";
	return cwd.split(sep).filter(Boolean).pop() ?? cwd;
}

const menuSx: SxProps<Theme> = {
	...dropdownStyleUp,
} as SxProps<Theme>;

export function RepoList({
	repos,
	selected,
	onSelect,
	onCustom,
	close,
}: {
	repos: string[];
	selected: string;
	onSelect: (cwd: string) => void;
	onCustom: () => void;
	close: () => void;
}) {
	return (
		<Paper elevation={4} sx={menuSx}>
			<MenuList dense>
				{repos.map((cwd) => (
					<MenuItem
						key={cwd}
						selected={cwd === selected}
						title={cwd}
						onClick={() => {
							onSelect(cwd);
							close();
						}}
						sx={{ fontSize: 12 }}
					>
						{repoName(cwd)}
					</MenuItem>
				))}
				<Divider />
				<MenuItem
					onClick={() => {
						close();
						onCustom();
					}}
					sx={{ fontSize: 12, color: "text.secondary", fontStyle: "italic" }}
				>
					Custom path...
				</MenuItem>
			</MenuList>
		</Paper>
	);
}
