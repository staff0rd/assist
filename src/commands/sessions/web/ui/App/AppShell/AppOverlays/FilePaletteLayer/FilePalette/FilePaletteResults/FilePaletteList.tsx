import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { FileTypeIcon } from "../../../../../FileTypeIcon";

const rowSx = {
	display: "flex",
	gap: 1,
	alignItems: "center",
	minWidth: 0,
} as const;

const labelsSx = {
	display: "flex",
	gap: 1,
	alignItems: "baseline",
	minWidth: 0,
	overflow: "hidden",
} as const;

const basenameSx = {
	fontFamily: "monospace",
	fontSize: 13,
	whiteSpace: "nowrap",
} as const;

const dirSx = {
	fontFamily: "monospace",
	fontSize: 11,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

function splitPath(path: string): { dir: string; basename: string } {
	const cut = path.lastIndexOf("/");
	return cut === -1
		? { dir: "", basename: path }
		: { dir: path.slice(0, cut), basename: path.slice(cut + 1) };
}

export function FilePaletteList({
	files,
	highlight,
	onHighlight,
	onSelect,
}: {
	files: string[];
	highlight: number;
	onHighlight: (index: number) => void;
	onSelect: (path: string) => void;
}) {
	return (
		<MenuList dense sx={{ py: 0 }}>
			{files.map((path, index) => {
				const { dir, basename } = splitPath(path);
				return (
					<MenuItem
						key={path}
						selected={index === highlight}
						onMouseEnter={() => onHighlight(index)}
						onClick={() => onSelect(path)}
						sx={rowSx}
					>
						<FileTypeIcon path={path} />
						<Box sx={labelsSx}>
							<Typography component="span" sx={basenameSx}>
								{basename}
							</Typography>
							<Typography component="span" color="text.secondary" sx={dirSx}>
								{dir}
							</Typography>
						</Box>
					</MenuItem>
				);
			})}
		</MenuList>
	);
}
