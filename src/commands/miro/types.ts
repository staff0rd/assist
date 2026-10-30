export type MiroRawItem = {
	id?: string;
	type?: string;
	data?: { content?: string };
	geometry?: { width?: number; height?: number };
	position?: { relativeTo?: string; x?: number; y?: number };
	parent?: { id?: string };
	miro_url?: string;
};

export type MiroRawPage = {
	data?: MiroRawItem[];
};

export type MiroItem = {
	id: string;
	type: string;
	text: string;
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export type MiroRect = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export type MiroBoardPreview = {
	boxes: MiroItem[];
};

export type MiroExtractOptions = {
	items?: string;
	topLeft?: string;
	bottomRight?: string;
	ignore?: string;
	out?: string;
	board?: string;
	frame?: string;
	save?: string;
	node?: boolean;
	repo?: boolean | string;
};

export type MiroExtractPaths = {
	cwd?: string;
	globalConfigPath?: string;
};
