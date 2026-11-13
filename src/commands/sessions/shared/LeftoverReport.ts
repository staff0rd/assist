export type LeftoverReport = {
	nodeName: string;
	leftovers: { path: string; reason: string }[];
	command: string | null;
};
