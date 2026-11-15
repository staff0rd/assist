import Box from "@mui/material/Box";
import { TargetLink } from "./TargetLink";

export function RowLink({ url }: { url: string }) {
	return (
		<Box
			component="span"
			sx={{
				minWidth: 0,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
			}}
		>
			<TargetLink url={url}>{url.replace(/^https?:\/\//, "")}</TargetLink>
		</Box>
	);
}
