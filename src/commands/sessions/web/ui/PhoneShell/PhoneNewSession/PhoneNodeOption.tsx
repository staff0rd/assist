import type { LinkStatus } from "../../../../daemon/links/LinkStatus";
import { NodeDot } from "../../HomeNodeGate/NodeDot";
import { linkStateTone } from "../PhoneNodesSheet/linkStateTone";

export function PhoneNodeOption({
	name,
	links,
}: {
	name: string;
	links: LinkStatus[];
}) {
	const link = links.find((l) => l.name === name);
	return (
		<>
			<NodeDot tone={link ? linkStateTone[link.state] : "ok"} />
			{name}
		</>
	);
}
