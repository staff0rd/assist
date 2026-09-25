import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import type { ReleaseNodeState } from "../../../../../../../releases/types";
import { releaseFactLineSx } from "./releaseFactLineSx";
import { ReleaseMark } from "../../../../ReleaseMark";
import type { ReleaseRunMark } from "./releaseNodeState";

export function ReleaseRunFacts({
	node,
	mark,
}: {
	node: ReleaseNodeState;
	mark: ReleaseRunMark;
}) {
	const url = node.run?.url;

	return (
		<Box sx={releaseFactLineSx}>
			{url ? (
				<Tooltip title={`${mark.tooltip} — open this job on GitHub`}>
					<Link href={url} target="_blank" rel="noreferrer">
						{mark.short}
					</Link>
				</Tooltip>
			) : (
				<ReleaseMark title={mark.tooltip}>{mark.short}</ReleaseMark>
			)}
		</Box>
	);
}
