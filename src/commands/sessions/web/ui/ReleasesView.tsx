import Stack from "@mui/material/Stack";
import { PageShell } from "./PageShell";
import { ReleaseStreamRow } from "./ReleaseStreamRow";
import { useReleasesState } from "./useReleasesState";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function ReleasesView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { streams, loading, error } = useReleasesState(selectedCwd);

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
				{streams.map((stream) => (
					<ReleaseStreamRow
						key={`${stream.repo}:${stream.name}`}
						stream={stream}
					/>
				))}
			</Stack>
		</PageShell>
	);
}
