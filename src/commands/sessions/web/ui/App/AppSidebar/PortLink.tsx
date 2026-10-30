import Link from "@mui/material/Link";
import { useNodeSelectionContext } from "../../useNodeSelectionContext";
import { portUrl } from "./portUrl";

export function PortLink({ port, node }: { port: number; node?: string }) {
	const { nodes } = useNodeSelectionContext();
	const { url, remote } = portUrl(port, node, nodes);
	return (
		<Link
			href={url}
			title={
				remote
					? `Opens ${url} on ${node}; the dev server must listen on the tailnet (e.g. --host 0.0.0.0)`
					: undefined
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
