import { sessionTextSize } from "../../../../../../sessionTextSize";

const headingSizes = {
	"& h1": "1.6rem",
	"& h2": "1.35rem",
	"& h3": "1.15rem",
	"& h4": "1.05rem",
	"& h5, & h6": "1rem",
};

export const transcriptHeadingSx = Object.fromEntries(
	Object.entries(headingSizes).map(([selector, size]) => [
		selector,
		{ fontSize: sessionTextSize(size) },
	]),
);
