export type SeqConnection = {
	name: string;
	url: string;
	apiToken: string;
};

export type SeqEvent = {
	Timestamp: string;
	Level: string;
	Exception?: string;
	Properties: { Name: string; Value: unknown }[];
	MessageTemplateTokens: ({ Text: string } | { PropertyName: string })[];
};
