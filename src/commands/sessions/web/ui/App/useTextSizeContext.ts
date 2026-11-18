import { createContext, useContext } from "react";

type TextSize = {
	textSizeOffset: number;
	setTextSizeOffset: (offset: number) => void;
};

export const TextSizeContext = createContext<TextSize>({
	textSizeOffset: 0,
	setTextSizeOffset: () => {},
});

export function useTextSizeContext(): TextSize {
	return useContext(TextSizeContext);
}
