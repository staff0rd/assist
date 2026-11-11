import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { LinkStatus } from "../../../../../../../../../daemon/links/LinkStatus";
import { formatRelativeTime } from "../../../../../../../formatRelativeTime";
import {
	bannerSx,
	bannerTextSx,
} from "../../../../nodeUpdates/NodeUpdateDetail/Advice/bannerSx";
import { protocolDirection } from "../../../protocolDirection";

const codeSx = { fontFamily: "fontFamilyMono", fontSize: 12 } as const;

export function LinkProblem({ link }: { link: LinkStatus }) {
	if (link.state === "disconnected" && link.error)
		return (
			<Box sx={bannerSx("error")}>
				<Typography variant="body2" sx={bannerTextSx}>
					<b>
						Last error
						{link.errorAt ? ` · ${formatRelativeTime(link.errorAt)}` : ""}
					</b>
					<Box
						component="code"
						sx={{ ...codeSx, display: "block", overflowWrap: "anywhere" }}
					>
						{link.error}
					</Box>
				</Typography>
			</Box>
		);
	if (link.state === "version-blocked") {
		const direction = protocolDirection(link);
		const target = direction === "newer" ? "this node" : link.name;
		return (
			<Box sx={bannerSx("warning")}>
				<Typography variant="body2" sx={bannerTextSx}>
					{link.name} runs {direction === "older" ? "an" : "a"} {direction} link
					protocol, so sessions and updates can't reach it over the link. Run{" "}
					<Box component="code" sx={codeSx}>
						assist update
					</Box>{" "}
					on {target}; the link reconnects on its own.
				</Typography>
			</Box>
		);
	}
	return null;
}
