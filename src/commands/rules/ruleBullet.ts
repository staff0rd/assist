type BulletRule = {
	code: string;
	title?: string | undefined;
	text: string;
};

export function ruleBullet({ code, title, text }: BulletRule): string {
	return title
		? `- **${code}** — **${title}** — ${text}`
		: `- **${code}** — ${text}`;
}
