import Box from "@mui/material/Box";
import type { ReleaseLayer } from "./releaseLayerLabels";
import { releaseLegendItems } from "./ReleaseLegend/releaseLegendItems";
import { ReleaseMark } from "./ReleaseMark";
import { releaseToneColors } from "./releaseToneColors";
import { releaseLegendSx } from "./releaseLegendSx";

export function ReleaseLegend({ layer }: { layer: ReleaseLayer }) {
	return (
		<Box sx={releaseLegendSx.legend}>
			<Box component="span" sx={releaseLegendSx.head}>
				hover anything for the long version
			</Box>
			{releaseLegendItems(layer).map((item) => (
				<Box component="span" key={item.label} sx={releaseLegendSx.entry}>
					<ReleaseMark
						title={item.tooltip}
						color={releaseToneColors[item.tone]}
					>
						{item.mark}
					</ReleaseMark>
					{item.label}
				</Box>
			))}
			<Box component="span" sx={releaseLegendSx.entry}>
				<ReleaseMark title="This promotion has happened — the target carries the source's commit">
					<Box
						component="span"
						sx={{
							...releaseLegendSx.edge,
							display: "block",
							bgcolor: "primary.main",
						}}
					/>
				</ReleaseMark>
				promoted
			</Box>
			<Box component="span" sx={releaseLegendSx.entry}>
				<ReleaseMark title="This promotion has not happened yet">
					<Box
						component="span"
						sx={{
							...releaseLegendSx.edge,
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
