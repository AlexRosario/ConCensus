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
	last_vote: null | string;
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
	username: string;
	email: string;
	password: string;
	zipcode: string;
	representatives: [];
};
export interface RelevantVote {
	congress: string;
	session: string;
	roll_Call: string;
}
