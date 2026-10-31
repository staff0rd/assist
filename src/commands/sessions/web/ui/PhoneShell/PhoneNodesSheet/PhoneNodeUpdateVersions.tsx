import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import { PhoneValueGroup } from "./PhoneValueGroup";

const shown = (version: string | undefined) => (version ? `v${version}` : "—");

export function PhoneNodeUpdateVersions({
	entry,
	latest,
}: {
	entry: NodeUpdateEntry;
	latest: string | undefined;
}) {
	return (
		<PhoneValueGroup
			title="Version"
			rows={[
				{
					key: "running",
					label: "Running",
					value: shown(entry.status?.running),
				},
				{ key: "built", label: "Built", value: shown(entry.status?.built) },
				{ key: "latest", label: "Latest seen", value: shown(latest) },
			]}
		/>
	);
}
