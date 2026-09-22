import Stack from "@mui/material/Stack";
import { useState } from "react";
import { PageShell } from "./PageShell";
import type { ReleaseLayer } from "./releaseLayerLabels";
import { ReleaseLayerToggle } from "./ReleaseLayerToggle";
import { ReleaseLegend } from "./ReleaseLegend";
import { ReleaseStreamRow } from "./ReleaseStreamRow";
import { useReleasesState } from "./useReleasesState";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

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
