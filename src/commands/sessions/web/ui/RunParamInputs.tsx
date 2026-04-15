import type { CSSProperties } from "react";
import { inputStyle, setFocusBorder } from "./buildPrompt";
import type { RunConfigInfo } from "./types";

const submitStyle: CSSProperties = {
	padding: "6px 12px",
	background: "#007acc",
	border: "none",
	borderRadius: 4,
	color: "#fff",
	fontSize: 13,
	cursor: "pointer",
	whiteSpace: "nowrap",
};

const labelStyle: CSSProperties = {
	fontSize: 11,
	color: "#999",
	marginBottom: 2,
};

type Param = NonNullable<RunConfigInfo["params"]>[number];

function paramLabel(p: Param): string {
	const suffix = p.description ? ` — ${p.description}` : "";
	return p.required ? `${p.name} *${suffix}` : `${p.name}${suffix}`;
}

export function RunParamInputs({
	config,
	values,
	onChange,
}: {
	config: RunConfigInfo;
	values: Record<string, string>;
	onChange: (v: Record<string, string>) => void;
}) {
	const params = config.params ?? [];

	const setParam = (name: string, value: string) =>
		onChange({ ...values, [name]: value });

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			{params.map((p) => (
				<label
					key={p.name}
					style={{ display: "flex", flexDirection: "column", ...labelStyle }}
				>
					{paramLabel(p)}
					<input
						value={values[p.name] ?? p.default ?? ""}
						onChange={(e) => setParam(p.name, e.target.value)}
						placeholder={p.default ?? ""}
						style={inputStyle}
						onFocus={(e) => setFocusBorder(e, "#007acc")}
						onBlur={(e) => setFocusBorder(e, "#555")}
					/>
				</label>
			))}
			<button type="submit" style={submitStyle}>
				Run {config.name}
			</button>
		</div>
	);
}
