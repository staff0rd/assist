import type { ReleaseStream } from "../../../../shared/types";

export function streamEnvironments(stream: ReleaseStream): string[] {
	return stream.nodes.flatMap((node) =>
		node.environment ? [node.environment] : [],
	);
}
