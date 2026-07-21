import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { renderMermaidDiagram } from "./renderMermaidDiagram";

export function MermaidDiagram({
	source,
	mode,
}: {
	source: string;
	mode: "light" | "dark";
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const target = ref.current;
		if (!target) return;
		let cancelled = false;
		void renderMermaidDiagram(target, source, mode, () => cancelled);
		return () => {
			cancelled = true;
		};
	}, [source, mode]);

	return <Box ref={ref} className="mermaid-diagram" />;
}
