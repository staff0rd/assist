import { z } from "zod";

const NAME = /^[A-Za-z0-9_.-]+$/;

export const linkStatusSchema = z.object({
	refs: z
		.array(
			z.object({
				owner: z.string().regex(NAME),
				repo: z.string().regex(NAME),
				number: z.number().int().positive(),
			}),
		)
		.max(1000),
});
