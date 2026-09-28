import { ServerRunDropdown } from "../../../ServerRunDropdown";
import { useServerRuns } from "../../../useServerRuns";

export function ServerRunMenu({
	onStartRun,
	cwd,
}: {
	onStartRun: (runName: string, cwd: string) => void;
	cwd: string | undefined;
}) {
	const runs = useServerRuns(cwd);

	if (!cwd || runs.length === 0) {
		return null;
	}

	return (
		<ServerRunDropdown
			runs={runs}
			onSelect={(runName) => onStartRun(runName, cwd)}
		/>
	);
}
