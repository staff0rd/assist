type ReadingWordCount = { prose: number; code: number };

const FENCE_PATTERN = /^\s*(```|~~~)/;

const IMAGE_PATTERN = /!\[[^\]]*\]\([^)]*\)/g;
const HTML_TAG_PATTERN = /<[^\s>][^>]*>/g;
const URL_PATTERN = /https?:\/\/\S+/g;

const SINGLE_WORD_PATTERNS = [IMAGE_PATTERN, HTML_TAG_PATTERN, URL_PATTERN];

export function countReadingWords(body: string): ReadingWordCount {
	let prose = 0;
	let code = 0;
	let inCode = false;

	for (const line of body.split("\n")) {
		if (FENCE_PATTERN.test(line)) {
			inCode = !inCode;
		} else if (inCode) {
			code += countTokens(line);
		} else {
			prose += countProseWords(line);
		}
	}

	return { prose, code };
}

function countProseWords(line: string): number {
	let singles = 0;
	let remaining = line;
	for (const pattern of SINGLE_WORD_PATTERNS) {
		remaining = remaining.replace(pattern, () => {
			singles += 1;
			return " ";
		});
	}
	return singles + countTokens(remaining);
}

function countTokens(text: string): number {
	return text.split(/\s+/).filter((token) => /[A-Za-z0-9]/.test(token)).length;
}
