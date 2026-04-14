import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import { FilterTrigger } from "./FilterTrigger";

export const dropdownStyle: CSSProperties = {
	position: "absolute",
	top: "100%",
	left: 0,
	right: 0,
	marginTop: 2,
	background: "#2d2d2d",
	border: "1px solid #444",
	borderRadius: 4,
	maxHeight: 200,
	overflowY: "auto",
	zIndex: 10,
};

export const dropdownStyleUp: CSSProperties = {
	...dropdownStyle,
	top: undefined,
	marginTop: undefined,
	bottom: "100%",
	marginBottom: 2,
};

export function DropdownWrapper({
	label,
	children,
}: {
	label: string;
	children: (close: () => void) => ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLFieldSetElement>(null);

	return (
		<fieldset
			ref={wrapperRef}
			style={{ position: "relative", border: "none", margin: 0, padding: 0 }}
			onBlur={(e) => {
				if (!wrapperRef.current?.contains(e.relatedTarget as Node))
					setOpen(false);
			}}
		>
			<FilterTrigger label={label} open={open} onClick={() => setOpen(!open)} />
			{open && children(() => setOpen(false))}
		</fieldset>
	);
}
