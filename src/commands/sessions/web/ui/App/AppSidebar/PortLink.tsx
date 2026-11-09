import Link from "@mui/material/Link";
import type { SessionInfo } from "../../types";
import { useNodeSelectionContext } from "../../useNodeSelectionContext";
import { portUrl } from "./portUrl";

export function PortLink({
	port,
	node,
	protocol,
	urlPath,
}: {
	port: number;
	node?: string;
	protocol?: SessionInfo["protocol"];
	urlPath?: string;
}) {
	const { nodes } = useNodeSelectionContext();
	const { url, remote } = portUrl(port, node, nodes, protocol, urlPath);
	return (
		<Link
			href={url}
			title={
				remote
					? `Opens ${url} on ${node}; the dev server must listen on the tailnet (e.g. --host 0.0.0.0)`
					: url
			}
			target="_blank"
			rel="noopener noreferrer"
			color="inherit"
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			:{port}
		</Link>
	);
}
