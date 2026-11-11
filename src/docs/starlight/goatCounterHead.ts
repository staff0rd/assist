type HeadEntry = {
	tag: "script";
	attrs: Record<string, string | boolean>;
};

export function goatCounterHead(code: string | undefined): HeadEntry[] {
	const trimmed = code?.trim();
	if (!trimmed) return [];
	return [
		{
			tag: "script",
			attrs: {
				"data-goatcounter": `https://${trimmed}.goatcounter.com/count`,
				async: true,
				src: "https://gc.zgo.at/count.js",
			},
		},
	];
}
