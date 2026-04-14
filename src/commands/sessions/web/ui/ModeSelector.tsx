import { MODES, modeButtonStyle, type SessionMode } from "./buildPrompt";

export function ModeSelector({
	mode,
	onSelect,
}: {
	mode: SessionMode;
	onSelect: (mode: SessionMode) => void;
}) {
	return (
		<div style={{ display: "flex", gap: 4 }}>
			{MODES.map((m) => (
				<button
					key={m.value}
					type="button"
					onClick={() => onSelect(m.value)}
					style={modeButtonStyle(mode === m.value)}
				>
					{m.label}
				</button>
			))}
		</div>
	);
}
