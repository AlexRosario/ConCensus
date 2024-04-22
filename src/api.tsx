import toast from 'react-hot-toast';

export const myHeaders = {
	'Content-Type': 'application/json',
};
export const googleCivicHeader = new Headers();
googleCivicHeader.append('Content-Type', 'application/json');
googleCivicHeader.append('key', 'AIzaSyCGKhpbY2SwNMXylL4IkV4TKDr8AwBJKuo');

export const proPublicaHeader = new Headers();
proPublicaHeader.append(
	'X-API-Key',
	'nymVg76FlGKy3VBdYBy96ZAYgk56fhvoYf8mUKmi'
);

proPublicaHeader.append('Content-Type', 'application/json');

export const congressGovHeader = new Headers();
congressGovHeader.append(
	'X-API-Key',
	'wbWdJxHyM4R2Vo9dCkI5jqdApMidOokgNWmHb8e3'
);
congressGovHeader.append('Content-Type', 'application/json');
export const Requests = {
	register: (
		username: string,
		email: string,
		password: string,
		zipcode: string,
		representatives: []
	) => {
		const url = 'http://localhost:3000/users';

		return fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: username,
				email: email,
				password: password,
				zipcode: zipcode,
				representatives: representatives,
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

	getCongressMembers: async (address: string) => {
		const apiKey = 'AIzaSyCGKhpbY2SwNMXylL4IkV4TKDr8AwBJKuo'; // Ensure this is securely included, not hardcoded
		const url = `https://www.googleapis.com/civicinfo/v2/representatives?key=${apiKey}&address=${encodeURIComponent(
			address
		)}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.statusText}`);
			}
			return await response.json();
		} catch (error) {
			console.error(error);
			// Handle the error appropriately
		}
	},
	getCongressMembersBioIds: async (offset: number) => {
		const apiKey = 'wbWdJxHyM4R2Vo9dCkI5jqdApMidOokgNWmHb8e3';
		const url = `https://api.congress.gov/v3/member?offset=${offset}&api_key=${apiKey}
		`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.statusText}`);
			}
			return await response.json();
		} catch (error) {
			console.error(error);
			// Handle the error appropriately
		}
	} /*
	addMemberToUser: async (user: null, member: null) => {
		const response = await fetch(`http://localhost:3000/users/${user.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				members: [...user.members, member],
			}),
		});

		if (response.ok) {
			console.log('Member added successfully');
		} else {
			console.error('Failed to add member');
		}
	},*/,
	addVoteToUser: async (user: null, allRepVotes: null, billId: string) => {
		const response = await fetch(`http://localhost:3000/users/${user.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				vote_log: {
					...user.vote_log,
					[billId]: {
						...user.vote_log[billId],
						RepVotes: allRepVotes,
					},
				},
			}),
		});

		if (response.ok) {
			console.log('Vote log updated successfully');
		} else {
			console.error('Failed to update vote log');
		}
	},
	getVoteLog: async (user: object) => {
		try {
			const response = await fetch(`/users/${user.id}/vote_log`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				console.log('Vote log fetched successfully');
				return await response.json();
			} else {
				console.error(
					`Failed to fetch vote log, status code: ${response.status}`
				);
				throw new Error(
					`HTTP error ${response.status} - ${response.statusText}`
				);
			}
		} catch (error) {
			console.error('Error fetching vote log:', error);
			throw error;
		}
	},

	getBillsRecent: (i: string) => {
		const url = `https://api.congress.gov/v3/bill?api_key=[INSERT_KEY]`;
		return fetch(url, {
			method: 'GET',
			headers: congressGovHeader,
		}).then((response) => {
			return response.json();
		});
	},
	getBillsBySubject: (subject: string, offset: number) => {
		const url = `https://api.propublica.org/congress/v1/bills/search.json?query=${subject}&&offset=${offset}`;
		return new Promise((resolve, reject) => {
			const attemptFetch = (retryCount: number, backoffDelay: number) => {
				fetch(url, {
					method: 'GET',
					headers: proPublicaHeader,
				})
					.then((response) => {
						if (!response.ok) throw new Error('Response not ok');
						console.log('Response received:', response);
						return response.text();
					})
					.then((text) => {
						try {
							console.log('Text received:');
							return JSON.parse(text); // Attempt to parse the text as JSON
						} catch (error) {
							// Throw if JSON parsing fails
							throw new Error('Failed to parse JSON');
						}
					})
					.then((data) => {
						resolve(data);
					})
					.catch((error) => {
						if (retryCount > 0) {
							console.log(`Retrying... Attempts left: ${retryCount}`);
							setTimeout(() => {
								attemptFetch(retryCount - 1, backoffDelay * 2);
							}, backoffDelay);
						} else {
							reject(error);
						}
					});
			};

			attemptFetch(3, 2000);
		});
	},
	getBillById: (billId: string) => {
		const url = `https://api.propublica.org/congress/v1/{congress}/bills/{bill-id}.json`;
		return fetch(url, {
			method: 'GET',
			headers: proPublicaHeader,
		}).then((response) => {
			return response.json();
		});
	},
	getVotesByDate: (date: string, chamber: string) => {
		const url = `https://api.propublica.org/congress/v1/${chamber}/votes/${date}.json`; //roll call number, session number, congress, and chamber. use house passage date plus minus 1 to 2 days
		return fetch(url, {
			method: 'GET',
			headers: proPublicaHeader,
		}).then((response) => {
			return response.json();
		});
	},
	getRollCallVotes: (
		congress: string,
		chamber: string,
		session: string,
		rollCallNumber: string
	) => {
		const url = `https://api.propublica.org/congress/v1/${congress}/${chamber}/sessions/${session}/votes/${rollCallNumber}.json`;
		return fetch(url, {
			method: 'GET',
			headers: proPublicaHeader,
		}).then((response) => {
			console.log('RollCall received:', response);
			return response.json();
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
	/*updateVoteLog: (vote) => {
		const url = 'http://localhost:3000/voteLogs';
		return fetch(url, {
			method: 'PATCH',
			headers: myHeaders,
			body: JSON.stringify({ voteLog: vote }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.catch((error) => console.error('Fetch error:', error));
	},*/
};

/*	getCongressMembers: (zipcode: string) => {
		const url = `/api/getall_mems.php?zip=${zipcode}&output=json`;

		return fetch(url, {
			method: 'GET',
			headers: myHeaders,
		}).then((response) => {
			return response.json();
		});
	},*/
