import Box from "@mui/material/Box";
import { CallHead } from "./CallHead";
import { callRowSx } from "./callRowSx";
import { TargetLink } from "./TargetLink";

export function UrlCallRow({ tool, url }: { tool: string; url: string }) {
	return (
		<Box data-preview-skip sx={{ ...callRowSx, "&:hover": undefined }}>
			<CallHead tool={tool} />
			<Box component="span" sx={{ minWidth: 0 }}>
				<TargetLink url={url} />
			</Box>
		</Box>
	);
}
