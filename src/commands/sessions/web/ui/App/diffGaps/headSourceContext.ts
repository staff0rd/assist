import { createContext } from "react";

export type HeadSource = {
	from: string;
	load: (path: string) => Promise<string[]>;
};

export const headSourceContext = createContext<HeadSource | undefined>(
	undefined,
);
