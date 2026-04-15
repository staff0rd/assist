import type { CSSProperties, MouseEvent } from "react";

export const cardActionButtonStyle: CSSProperties = {
	background: "none",
	border: "none",
	color: "#888",
	cursor: "pointer",
	lineHeight: 1,
	padding: "2px 4px",
	borderRadius: "50%",
	transition: "background 0.15s, color 0.15s",
};

export function cardActionHover(
	e: MouseEvent<HTMLButtonElement>,
	enter: boolean,
) {
	e.currentTarget.style.background = enter ? "#4a4a4a" : "none";
	e.currentTarget.style.color = enter ? "#d4d4d4" : "#888";
}
