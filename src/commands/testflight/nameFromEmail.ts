function capitalise(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

// App Store Connect requires a first and last name on every team invitation.
export function nameFromEmail(email: string): {
	firstName: string;
	lastName: string;
} {
	const [first = email, ...rest] = email
		.split("@")[0]
		.split(/[._+-]+/)
		.filter(Boolean)
		.map(capitalise);
	return { firstName: first, lastName: rest.join(" ") || "Tester" };
}
