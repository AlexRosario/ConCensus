export function isEmailValid(emailAddress: string) {
	// eslint-disable-next-line no-useless-escape
	const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return !!emailAddress.match(regex);
}

export function isPhoneValid(phoneInput: [string, string, string, string]) {
	return !!(phoneInput.join('').length === 9);
}

export function isNameValid(name: string) {
	const regex = /^[a-zA-Z]+$/;
	return !!(name.match(regex) && name.length >= 2);
}

export function isZipcodeValid(zipcode: string) {
	if (zipcode.length !== 5) {
		return false;
	}
	const regex = /^[0-9]+$/;
	return !!zipcode.match(regex);
}
