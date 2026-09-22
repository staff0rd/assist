import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import { type ReleaseLayer, releaseLayerLabels } from "./releaseLayerLabels";

const wrapSx = { display: "flex", justifyContent: "flex-end" } as const;

const layerNotes: Record<ReleaseLayer, string> = {
	live: "What each environment is running right now",
	run: "How far the latest run of this workflow has reached",
};

export function ReleaseLayerToggle({
	layer,
	onChange,
}: {
	layer: ReleaseLayer;
	onChange: (layer: ReleaseLayer) => void;
}) {
	return (
		<Box sx={wrapSx}>
			<ToggleButtonGroup
				size="small"
				exclusive
				value={layer}
				aria-label="Data layer"
				onChange={(_event, next: ReleaseLayer | null) => {
					if (next) onChange(next);
				}}
			>
				{(Object.keys(releaseLayerLabels) as ReleaseLayer[]).map((key) => (
					<Tooltip key={key} title={layerNotes[key]}>
						<ToggleButton value={key}>{releaseLayerLabels[key]}</ToggleButton>
					</Tooltip>
				))}
			</ToggleButtonGroup>
		</Box>
	);
}
