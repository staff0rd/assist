const CLASS_ATTRIBUTE = /(\sclass\s*=\s*)(["'])(.*?)\2/;

export function withTagClass(tag: string, className: string): string {
	if (CLASS_ATTRIBUTE.test(tag))
		return tag.replace(
			CLASS_ATTRIBUTE,
			(_, prefix: string, quote: string, value: string) =>
				`${prefix}${quote}${value} ${className}${quote}`,
		);
	return tag.replace(/\s*\/?>$/, (end) => ` class="${className}"${end}`);
}
