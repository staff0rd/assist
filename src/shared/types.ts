type RunConfig = {
	name: string;
	command: string;
	args?: string[];
};

export type AssistConfig = {
	commit?: {
		conventional?: boolean;
	};
	devlog?: {
		name?: string;
		ignore?: string[];
		skip?: {
			days?: string[];
		};
	};
	run?: RunConfig[];
};
