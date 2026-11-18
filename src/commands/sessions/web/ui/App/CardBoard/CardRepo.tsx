import Box from "@mui/material/Box";
import { repoGroupKey } from "../../repoGroupKey";
import type { SessionInfo } from "../../types";
import { repoLabel } from "../repoLabel";
import { sessionTypeSize } from "../sessionTypeSize";

export function CardRepo({ session }: { session: SessionInfo }) {
	const repo = repoLabel(repoGroupKey(session));
	if (!repo) return null;
	return (
		<Box
			component="span"
			data-testid="card-repo"
			sx={{
				minWidth: 0,
				typography: "caption",
				fontSize: sessionTypeSize("caption"),
				fontFamily: "fontFamilyMono",
				color: "text.secondary",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
			}}
		>
			{repo}
		</Box>
	);
}
