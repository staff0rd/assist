import { type ReactNode, useEffect, useMemo } from "react";
import { useGlobalConfigValue } from "../../../useGlobalConfigValue";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";
import { textSizeOffset } from "../../textSizeOffset";
import { TextSizeContext } from "../../useTextSizeContext";

export function TextSizeProvider({
	localCwd,
	children,
}: {
	localCwd: string;
	children: ReactNode;
}) {
	const { selectedCwd } = useRepoSelectionContext();
	const [offset, setOffset] = useGlobalConfigValue(
		"sessions.textSizeOffset",
		localCwd || selectedCwd,
		textSizeOffset,
		true,
	);
	useEffect(() => {
		document.documentElement.style.setProperty(
			"--session-text-offset",
			`${offset}px`,
		);
	}, [offset]);
	const value = useMemo(
		() => ({
			textSizeOffset: offset,
			setTextSizeOffset: (next: number) => setOffset(textSizeOffset(next)),
		}),
		[offset, setOffset],
	);
	return (
		<TextSizeContext.Provider value={value}>
			{children}
		</TextSizeContext.Provider>
	);
}
