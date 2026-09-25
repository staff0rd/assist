import type { SvgIconComponent } from "@mui/icons-material";
import FolderZipOutlined from "@mui/icons-material/FolderZipOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import StorageOutlined from "@mui/icons-material/StorageOutlined";
import Box from "@mui/material/Box";
import { deviconForExtension } from "./FileTypeIcon/deviconForExtension";

const size = 16;

const muiIcons: Record<string, SvgIconComponent> = {
	gif: ImageOutlined,
	gz: FolderZipOutlined,
	ico: ImageOutlined,
	jpeg: ImageOutlined,
	jpg: ImageOutlined,
	pdf: PictureAsPdfOutlined,
	png: ImageOutlined,
	sql: StorageOutlined,
	svg: ImageOutlined,
	tar: FolderZipOutlined,
	webp: ImageOutlined,
	zip: FolderZipOutlined,
};

const wrapperSx = {
	width: size,
	height: size,
	flexShrink: 0,
	display: "flex",
	alignItems: "center",
} as const;

const muiSx = { fontSize: size, color: "text.secondary" } as const;

function keyFor(path: string): string {
	const basename = path.slice(path.lastIndexOf("/") + 1).toLowerCase();
	const cut = basename.lastIndexOf(".");
	return cut <= 0 ? basename : basename.slice(cut + 1);
}

export function FileTypeIcon({ path }: { path: string }) {
	const key = keyFor(path);
	const devicon = deviconForExtension(key);
	const MuiIcon = muiIcons[key] ?? InsertDriveFileOutlined;

	return (
		<Box sx={wrapperSx}>
			{devicon ? (
				<devicon.Icon size={size} fill={devicon.unpaintedFill} />
			) : (
				<MuiIcon sx={muiSx} />
			)}
		</Box>
	);
}
