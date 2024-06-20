export interface HouseBill {
	active: boolean;
	bill_id: string;
	bill_slug: string;
	bill_type: string;
	bill_uri: string;
	committee_codes: string[];
	committees: string;
	congressdotgov_url: string;
	cosponsors: number;
	cosponsors_by_party: {
		D?: number;
		R?: number;
		I?: number;
	};
	enacted: null | string;
	govtrack_url: string;
	gpo_pdf_uri: null | string;
	house_passage: null | string;
	introduced_date: string;
	last_vote: string;
	latest_major_action: string;
	latest_major_action_date: string;
	number: string;
	primary_subject: string;
	senate_passage: null | string;
	short_title: string;
	sponsor_id: string;
	sponsor_name: string;
	sponsor_party: string;
	sponsor_state: string;
	sponsor_title: string;
	sponsor_uri: string;
	subcommittee_codes: string[];
	summary: string;
	summary_short: string;
	title: string;
	vetoed: null | string;
}
export type User = {
	id: string;
	vote_log: object;
	username: string;
	email: string;
	password: string;
	address: {
		street: string;
		city: string;
		state: string;
		zipcode: string;
	};
	representatives: string[];
};
export type ProPublicaType = {
	status: string;
	copyright: string;
	results: {
		congress: string;
		chamber: string;
		num_results: number;
		offset: number;
		members: ProPublicaMember[];
	};
};
export type ProPublicaMember = {
	id: string;
	title: string;
	short_title: string;
	api_uri: string;
	first_name: string;
	middle_name: string | null;
	last_name: string;
	suffix: string | null;
	date_of_birth: string;
	gender: string;
	party: string;
	leadership_role: string | null;
	twitter_account: string | null;
	facebook_account: string | null;
	youtube_account: string | null;
	govtrack_id: string;
	cspan_id: string;
	votesmart_id: string;
	icpsr_id: string;
	crp_id: string;
	google_entity_id: string;
	fec_candidate_id: string;
	url: string;
	rss_url: string;
	contact_form: string;
	in_office: boolean;
	cook_pvi: string | null;
	dw_nominate: number;
	ideal_point: number | null;
	seniority: string;
	next_election: string;
	total_votes: number;
	missed_votes: number;
	total_present: number;
	last_updated: string;
	ocd_id: string;
	office: string;
	phone: string;
	fax: string;
	state: string;
	senate_class: string;
	state_rank: string;
	lis_id: string;
	missed_votes_pct: number;
	votes_with_party_pct: number;
	votes_against_party_pct: number;
};

export interface CongressMember {
	bioguideId: string;
	name: string;
	party: string;
	partyName: string;
	state: string;
	phones: string[];
	urls: string[];
	photoUrl: string;
	district: string;
	url: string;
	address: string[];
	terms: {
		item: string[];
	};
	updateDate: string;
	channels: string[];
	depiction: string[];
	votes_with_party_pct?: number;
	office_title: string;
	office: string;
	title: { name: string };
}

export interface RelevantVote {
	chamber: string;
	roll_call(
		congress: string,
		arg1: string,
		session: string,
		roll_call: string
	): unknown;
	congress: string;
	session: string;
	roll_Call: string;
}
export type MemberVote = {
	cook_pvi: string | null;
	district: string;
	dw_nominate: number | null;
	member_id: string;
	name: string;
	party: 'D' | 'R' | 'I';
	state: string;
	vote_position: 'Yes' | 'No' | 'Present' | 'Not Voting';
};
type PartyVotes = {
	yes: number;
	no: number;
	present: number;
	not_voting: number;
};

export type RollCall = {
	copyright: string;
	results: {
		votes: {
			vacant_seats: Array<Record<string, unknown>>;
			vote: {
				amendment: Record<string, unknown>;
				bill: string;
				chamber: string;
				congress: number;
				date: string;
				democratic: PartyVotes;
				description: string;
				independent: PartyVotes;
				positions: Array<Record<string, unknown>>;
				question: string;
				question_text: string;
				republican: PartyVotes;
				result: string;
				roll_call: number;
				session: number;
				source: string;
				time: string;
				total: PartyVotes;
				url: string;
				vote_type: string;
			};
		};
	};
	status: string;
};

export type VoteRecord = {
	amendment: Record<string, unknown>;
	bill: {
		bill_id: string;
		number: string;
		sponsor_id: string;
		api_uri: string;
		title: string;
	};
	chamber: string;
	congress: string;
	date: string;
	democratic: {
		yes: number;
		no: number;
		present: number;
		not_voting: number;
		majority_position: string;
	};
	description: string;
	independent: {
		yes: number;
		no: number;
		present: number;
		not_voting: number;
	};
	question: string;
	question_text: string;
	republican: {
		yes: number;
		no: number;
		present: number;
		not_voting: number;
		majority_position: string;
	};
	result: string;
	roll_call: string;
	session: string;
	source: string;
	time: string;
	total: {
		yes: number;
		no: number;
		present: number;
		not_voting: number;
	};
	url: string;
	vote_type: string;
	vote_uri: string;
};
