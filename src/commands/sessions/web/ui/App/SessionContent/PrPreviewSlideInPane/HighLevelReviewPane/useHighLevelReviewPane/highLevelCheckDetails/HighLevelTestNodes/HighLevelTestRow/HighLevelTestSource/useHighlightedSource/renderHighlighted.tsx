import type { ReactNode } from "react";
import type { RefractorNode } from "refractor/core";

function classNameOf(node: RefractorNode): string | undefined {
	const className = node.properties?.className;
	return Array.isArray(className) ? className.join(" ") : undefined;
}

export function renderHighlighted(nodes: RefractorNode[]): ReactNode[] {
	return nodes.map((node, index) =>
		node.type === "text" ? (
			node.value
		) : (
			<span key={index} className={classNameOf(node)}>
				{renderHighlighted(node.children ?? [])}
			</span>
		),
	);
}
