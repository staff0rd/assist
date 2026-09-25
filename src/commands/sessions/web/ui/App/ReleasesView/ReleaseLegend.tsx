import Box from "@mui/material/Box";
import type { ReleaseLayer } from "./releaseLayerLabels";
import { releaseLegendItems } from "./ReleaseLegend/releaseLegendItems";
import { ReleaseMark } from "./ReleaseMark";
import { releaseToneColors } from "./releaseToneColors";

const legendSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	gap: 2,
	pt: 1.5,
	mt: 1,
	borderTop: 1,
	borderColor: "divider",
	fontSize: 14.4,
	color: "text.secondary",
} as const;

const entrySx = { display: "inline-flex", alignItems: "center", gap: 0.75 };

const headSx = {
	fontFamily: "monospace",
	fontSize: 12.6,
	letterSpacing: "0.09em",
	textTransform: "uppercase",
} as const;

const edgeSx = { width: 22, height: 2 } as const;

export function ReleaseLegend({ layer }: { layer: ReleaseLayer }) {
	return (
		<Box sx={legendSx}>
			<Box component="span" sx={headSx}>
				hover anything for the long version
			</Box>
			{releaseLegendItems(layer).map((item) => (
				<Box component="span" key={item.label} sx={entrySx}>
					<ReleaseMark
						title={item.tooltip}
						color={releaseToneColors[item.tone]}
					>
						{item.mark}
					</ReleaseMark>
					{item.label}
				</Box>
			))}
			<Box component="span" sx={entrySx}>
				<ReleaseMark title="This promotion has happened — the target carries the source's commit">
					<Box
						component="span"
						sx={{ ...edgeSx, display: "block", bgcolor: "primary.main" }}
					/>
				</ReleaseMark>
				promoted
			</Box>
			<Box component="span" sx={entrySx}>
				<ReleaseMark title="This promotion has not happened yet">
					<Box
						component="span"
						sx={{
							...edgeSx,
							display: "block",
							borderTop: "2px dashed",
							borderColor: "text.disabled",
							height: 0,
						}}
					/>
				</ReleaseMark>
				not yet
			</Box>
		</Box>
	);
}
