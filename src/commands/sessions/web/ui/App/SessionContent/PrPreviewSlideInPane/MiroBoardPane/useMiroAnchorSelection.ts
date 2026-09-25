import { useState } from "react";

export type AnchorRole = "top-left" | "bottom-right";

export type MiroAnchorSelection = {
	topLeft: string | null;
	bottomRight: string | null;
	choose: (id: string) => void;
	reset: () => void;
	roleOf: (id: string) => AnchorRole | null;
};

export function useMiroAnchorSelection(): MiroAnchorSelection {
	const [topLeft, setTopLeft] = useState<string | null>(null);
	const [bottomRight, setBottomRight] = useState<string | null>(null);

	const reset = () => {
		setTopLeft(null);
		setBottomRight(null);
	};

	const choose = (id: string) => {
		if (topLeft === null || bottomRight !== null) {
			setTopLeft(id);
			setBottomRight(null);
			return;
		}
		setBottomRight(id);
	};

	const roleOf = (id: string): AnchorRole | null => {
		if (id === topLeft) return "top-left";
		if (id === bottomRight) return "bottom-right";
		return null;
	};

	return { topLeft, bottomRight, choose, reset, roleOf };
}
