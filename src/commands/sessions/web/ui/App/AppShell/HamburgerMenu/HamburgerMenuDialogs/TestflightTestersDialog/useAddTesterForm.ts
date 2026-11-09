import { type FormEvent, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useAddTesterForm(
	pending: boolean,
	onAdd: (email: string, internal: boolean) => Promise<boolean>,
) {
	const [email, setEmail] = useState("");
	const [internal, setInternal] = useState(false);
	const valid = EMAIL_PATTERN.test(email.trim());

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (!valid || pending) return;
		const value = email.trim();
		setEmail("");
		if (!(await onAdd(value, internal))) setEmail(value);
	};

	return { email, setEmail, internal, setInternal, valid, submit };
}
