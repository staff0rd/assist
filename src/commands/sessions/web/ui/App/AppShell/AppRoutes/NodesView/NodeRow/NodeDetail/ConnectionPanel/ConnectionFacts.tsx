import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { NodeRowData } from "../../../nodeRows";
import { linkStateLabel } from "./linkStateLabel";

const kvSx = {
	display: "grid",
	gridTemplateColumns: "auto minmax(0,1fr)",
	columnGap: 1.5,
	rowGap: 0.5,
	m: 0,
	"& dt": { color: "text.secondary" },
	"& dd": { m: 0, minWidth: 0, overflowWrap: "anywhere" },
} as const;

const monoSx = { fontFamily: "fontFamilyMono", fontSize: 12 } as const;

export function ConnectionFacts({ row }: { row: NodeRowData }) {
	const { link } = row;
	return (
		<Typography variant="body2" component="dl" sx={kvSx}>
			<dt>URL</dt>
			<Box component="dd" sx={monoSx}>
				{row.url}
			</Box>
			<dt>Link</dt>
			<dd>{link ? linkStateLabel[link.state] : "This node"}</dd>
			{link?.peerProtocol !== undefined && (
				<>
					<dt>Protocol</dt>
					<dd>
						<Box component="span" sx={monoSx}>
							{link.peerProtocol}
						</Box>
						{link.protocol !== undefined && (
							<>
								{" "}
								· this node{" "}
								<Box component="span" sx={monoSx}>
									{link.protocol}
								</Box>
							</>
						)}
					</dd>
				</>
			)}
		</Typography>
	);
}
