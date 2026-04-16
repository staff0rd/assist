import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { inputStyle } from "./isAssistMode";

const okStyle: CSSProperties = {
	padding: "4px 8px",
	fontSize: 11,
	background: "#007acc",
	border: "none",
	borderRadius: 4,
	color: "#fff",
	cursor: "pointer",
};

const cancelStyle: CSSProperties = {
	padding: "4px 8px",
	fontSize: 11,
	background: "none",
	border: "1px solid #555",
	borderRadius: 4,
	color: "#999",
	cursor: "pointer",
};

export function CustomPathInput({
	onConfirm,
	onCancel,
}: {
	onConfirm: (path: string) => void;
	onCancel: () => void;
}) {
	const [value, setValue] = useState("");
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				const p = value.trim();
				if (p) onConfirm(p);
			}}
			style={{ display: "flex", gap: 4 }}
		>
			<input
				ref={ref}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="/path/to/repo"
				style={{ ...inputStyle, fontSize: 12 }}
				onKeyDown={(e) => {
					if (e.key === "Escape") onCancel();
				}}
			/>
			<button type="submit" style={okStyle}>
				OK
			</button>
			<button type="button" onClick={onCancel} style={cancelStyle}>
				Cancel
			</button>
		</form>
	);
}
