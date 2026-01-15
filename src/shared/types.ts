type RunConfig = {
	name: string;
	command: string;
	args?: string[];
};

export type AssistConfig = {
	devlog?: {
		name?: string;
		ignore?: string[];
		skip?: {
			days?: string[];
		};
	};
	run?: RunConfig[];
};
