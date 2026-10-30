import { useEffect, useState } from "react";

const KEYBOARD_MIN_HEIGHT_PX = 120;

type KeyboardViewport = {
	height: number;
	offsetTop: number;
	keyboardOpen: boolean;
};

function read(): KeyboardViewport {
	const vv = window.visualViewport;
	const height = vv?.height ?? window.innerHeight;
	return {
		height,
		offsetTop: vv?.offsetTop ?? 0,
		keyboardOpen: window.innerHeight - height > KEYBOARD_MIN_HEIGHT_PX,
	};
}

export function useKeyboardViewport(): KeyboardViewport {
	const [viewport, setViewport] = useState(read);

	useEffect(() => {
		const vv = window.visualViewport;
		if (!vv) return;
		const update = () => setViewport(read());
		vv.addEventListener("resize", update);
		vv.addEventListener("scroll", update);
		return () => {
			vv.removeEventListener("resize", update);
			vv.removeEventListener("scroll", update);
		};
	}, []);

	return viewport;
}
