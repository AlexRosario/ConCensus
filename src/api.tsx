import toast from 'react-hot-toast';

export const myHeaders = {
	'Content-Type': 'application/json',
};

export const proPublicaHeader = new Headers();
proPublicaHeader.append(
	'X-API-Key',
	'nymVg76FlGKy3VBdYBy96ZAYgk56fhvoYf8mUKmi'
);

// Define your requests object
export const Requests = {
	getCongressMembers: (zipcode: string) => {
		const url = `/api/getall_mems.php?zip=${zipcode}&output=json`;

		return fetch(url, {
			method: 'GET',
			headers: myHeaders,
		}).then((response) => {
			return response.json();
		});
	},
	getBills: (i: string) => {
		const url = `https://api.propublica.org/congress/v1/house/votes/recent.json?offset=${i}`;
		return fetch(url, {
			method: 'GET',
			headers: proPublicaHeader,
		}).then((response) => {
			return response.json();
		});
	},
	getBillsBySubject: (subject: string, offset: number) => {
		const url = `https://api.propublica.org/congress/v1/bills/subjects/${subject}.json?offset=${offset}`;
		return fetch(url, {
			method: 'GET',
			headers: proPublicaHeader,
		}).then((response) => {
			return response.json();
		});
	},

	register: (username: string, password: string, zipcode: string) => {
		const url = 'http://localhost:3000/users';

		return fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: username,
				password: password,
				zipcode: zipcode,
			}),
		})
			.then((response) => {
				console.log('Response received:', response);
				if (!response.ok) {
					throw new Error(
						`HTTP Error: ${response.status} ${response.statusText}`
					);
				}

				return response.json();
			})
			.catch((error) => {
				toast.error('Not a valid zipcode');
				error.message = 'Not a valid zipcode';
			});
	},
	getAllUsers: () => {
		const url = 'http://localhost:3000/users';
		return fetch(url, {
			method: 'GET',
			headers: myHeaders,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.catch((error) => console.error('Fetch error:', error));
	},
};
