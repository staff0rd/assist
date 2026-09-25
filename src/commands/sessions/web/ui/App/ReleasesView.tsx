import Stack from "@mui/material/Stack";
import { useState } from "react";
import { PageShell } from "./PageShell";
import type { ReleaseLayer } from "./ReleasesView/releaseLayerLabels";
import { ReleaseLayerToggle } from "./ReleasesView/ReleaseLayerToggle";
import { ReleaseLegend } from "./ReleasesView/ReleaseLegend";
import { ReleaseStreamRow } from "./ReleasesView/ReleaseStreamRow";
import { useReleasesState } from "./ReleasesView/useReleasesState";
import { useRepoSelectionContext } from "../useRepoSelectionContext";

const pageSx = { maxWidth: { lg: 1440 } } as const;

export function ReleasesView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { streams, loading, error } = useReleasesState(selectedCwd);
	const [layer, setLayer] = useState<ReleaseLayer>("live");

	return (
		<PageShell
			loading={loading}
			title="Releases"
			isEmpty={streams.length === 0}
			emptyMessage={
				error ?? "No release streams declared under releases.streams."
			}
			maxWidth="lg"
			sx={pageSx}
		>
			<Stack spacing={1}>
				<ReleaseLayerToggle layer={layer} onChange={setLayer} />
				{streams.map((stream) => (
					<ReleaseStreamRow
						key={`${stream.repo}:${stream.name}`}
						stream={stream}
						layer={layer}
					/>
				))}
				<ReleaseLegend layer={layer} />
			</Stack>
		</PageShell>
	);
}
