type PhoneKey = { label: string; data: string; warn?: boolean };

const enter = { label: "⏎", data: "\r" };
const esc = { label: "esc", data: "\x1b" };
const up = { label: "↑", data: "\x1b[A" };
const down = { label: "↓", data: "\x1b[B" };

export function phoneKeys(waiting: boolean): PhoneKey[] {
	if (waiting)
		return [
			{ label: "1", data: "1" },
			{ label: "2", data: "2" },
			{ label: "3", data: "3" },
			up,
			down,
			enter,
			esc,
		];
	return [
		esc,
		{ label: "tab", data: "\t" },
		{ label: "⇧tab", data: "\x1b[Z" },
		up,
		down,
		{ label: "⌃C", data: "\x03", warn: true },
		{ label: "/", data: "/" },
		enter,
	];
}
