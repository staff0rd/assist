import { type CSSProperties, useEffect, useRef } from "react";
import { copyRenderRates } from "./RenderRateHud/copyRenderRates";
import { renderCounters } from "../../../renderCounters";
import {
	formatRenderRates,
	sampleRenderRates,
} from "./RenderRateHud/sampleRenderRates";
import { useRenderHudEnabled } from "../useRenderHudEnabled";

const SAMPLE_MS = 500;

const hudStyle: CSSProperties = {
	position: "fixed",
	bottom: 8,
	right: 8,
	zIndex: 3000,
	background: "rgba(0, 0, 0, 0.8)",
	color: "#7cfc9a",
	font: "11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace",
	padding: "6px 8px",
	borderRadius: 4,
	whiteSpace: "pre",
	cursor: "pointer",
	userSelect: "none",
};

export function RenderRateHud() {
	const ref = useRef<HTMLDivElement | null>(null);
	const text = useRef("");
	const enabled = useRenderHudEnabled();

	useEffect(() => {
		if (!enabled) return;
		let previous = new Map(renderCounters);
		let sampledAt = performance.now();
		let frame = requestAnimationFrame(function tick() {
			frame = requestAnimationFrame(tick);
			const now = performance.now();
			if (now - sampledAt < SAMPLE_MS) return;
			const rates = sampleRenderRates(
				renderCounters,
				previous,
				now - sampledAt,
			);
			previous = new Map(renderCounters);
			sampledAt = now;
			text.current = formatRenderRates(rates);
			if (ref.current) ref.current.textContent = text.current;
		});
		return () => cancelAnimationFrame(frame);
	}, [enabled]);

	if (!enabled) return null;

	return (
		<div
			ref={ref}
			style={hudStyle}
			title="Click to copy"
			onClick={() => copyRenderRates(ref.current, text.current)}
			onKeyDown={() => copyRenderRates(ref.current, text.current)}
		/>
	);
}
