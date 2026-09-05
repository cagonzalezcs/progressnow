import { d as defineEventHandler, u as useRuntimeConfig, c as createError, g as getRouterParam, a as getQuery, s as setResponseHeader } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

var lang$5 = "";
var homeUrl$1 = "http://example.org/";
var apiBase = "http://example.org/index.php?rest_route=/progressnow/v1";
var languages$7 = [
];
var chapter = {
	name: "Progress Now",
	short_name: "Progress Now",
	region_label: "our community",
	join_url: "/get-involved/#join",
	newsletter_url: "",
	contact_email: "",
	footer_tagline: "",
	instagram_url: "",
	committees: [
		{
			name: "Political Education",
			desc: "Reading groups, night school, and workshops that build our shared analysis."
		},
		{
			name: "Mutual Aid",
			desc: "Meeting our neighbors' immediate needs while organizing for lasting change."
		},
		{
			name: "Labor",
			desc: "Supporting workers organizing on the job across our community."
		},
		{
			name: "Communications",
			desc: "Social media, design, and this website — telling the chapter's story."
		},
		{
			name: "Electoral",
			desc: "Backing candidates and ballot measures that fight for working people."
		},
		{
			name: "Membership & Onboarding",
			desc: "Welcoming new members and making sure no one falls through the cracks."
		}
	],
	socials: [
		{
			name: "Facebook",
			url: ""
		},
		{
			name: "Instagram",
			url: ""
		},
		{
			name: "Twitter",
			url: ""
		}
	]
};
var identity = {
	name: "Progress Now",
	short_name: "Progress Now",
	region_label: "our community",
	hero_headline: "A better world is possible!",
	logo_header: {
		src: "",
		alt: "Progress Now",
		width: 0,
		height: 0,
		is_default: true
	},
	logo_footer: {
		src: "",
		alt: "Progress Now",
		width: 0,
		height: 0,
		is_default: true
	},
	logo_square: {
		src: "/wp-content/themes/progressnow/static/images/brand/logo-square.png",
		alt: "Progress Now",
		width: 512,
		height: 512,
		is_default: true
	},
	share_image: {
		src: "/wp-content/themes/progressnow/static/images/brand/share-default.jpg",
		alt: "Progress Now",
		width: 1200,
		height: 630,
		is_default: true
	},
	hero_photo: {
		src: "/wp-content/themes/progressnow/static/images/brand/hero-photo.jpg",
		alt: "Chapter members gathered at a community action",
		width: 951,
		height: 716,
		is_default: true
	},
	who_image: {
		src: "/wp-content/themes/progressnow/static/images/brand/who-photo.jpg",
		alt: "Volunteers working together at a community event",
		width: 920,
		height: 700,
		is_default: true
	},
	cta_panel: {
		src: "/wp-content/themes/progressnow/static/images/brand/cta-panel.svg",
		alt: "",
		width: 1281,
		height: 563,
		is_default: true
	}
};
var header = {
	navItems: [
		{
			label: "Calendar",
			href: "/calendar/"
		},
		{
			label: "Blog",
			href: "/blog/"
		},
		{
			label: "Get Involved",
			href: "/get-involved/"
		}
	],
	aboutItems: [
		{
			label: "About the Chapter",
			href: "/about/"
		},
		{
			label: "Mission & History",
			href: "/about/#mission"
		},
		{
			label: "Where We Organize",
			href: "/about/#counties"
		},
		{
			label: "Committees",
			href: "/about/#committees"
		},
		{
			label: "Bylaws & Code of Conduct",
			href: "/about/#bylaws"
		},
		{
			label: "FAQ",
			href: "/about/#faq"
		}
	],
	joinLabel: "Join us",
	joinShortLabel: "Join",
	aboutLabel: "About",
	joinUrl: "/get-involved/#join",
	logoUrl: "",
	logoIsDefault: true,
	orgName: "Progress Now",
	homeUrl: "/"
};
var footer = {
	logoUrl: "",
	logoIsDefault: true,
	orgName: "Progress Now",
	columns: null,
	socials: [
		{
			name: "Facebook",
			url: ""
		},
		{
			name: "Instagram",
			url: ""
		},
		{
			name: "Twitter",
			url: ""
		}
	],
	contactEmail: "",
	tagline: "",
	a11yLead: "Built to be accessible —",
	a11yLinkLabel: "tell us how we can do better."
};
var strings = {
	nav_about: "About",
	nav_calendar: "Calendar",
	nav_blog: "Blog",
	nav_get_involved: "Get Involved",
	cta_join: "Join us",
	cta_join_short: "Join",
	about_chapter: "About the Chapter",
	about_mission: "Mission & History",
	about_counties: "Where We Organize",
	about_committees: "Committees",
	about_bylaws: "Bylaws & Code of Conduct",
	about_faq: "FAQ",
	skip_link: "Skip to main content",
	footer_a11y_lead: "Built to be accessible —",
	footer_a11y_link: "tell us how we can do better.",
	home_hero_headline: "A better world is possible!",
	home_hero_photo_alt: "Chapter members gathered at a community action",
	home_who_photo_alt: "Volunteers working together at a community event",
	home_cta_line: "Progress now, not someday!",
	cta_join_now: "Join Now",
	home_events_head: "Upcoming events",
	home_events_all: "Full calendar",
	home_events_empty_h: "No events on the books yet",
	home_events_empty_p: "New meetings and actions land on the %s first — subscribe there and never miss one.",
	home_events_empty_link: "calendar",
	home_view_event: "View event",
	home_blog_head: "From the blog",
	home_blog_all: "All posts",
	home_blog_read: "Read the post",
	home_blog_empty_h: "Posts coming soon",
	home_blog_empty_p: "The chapter is writing its first dispatches — check back shortly.",
	blog_crumb_home: "Home",
	blog_crumb_blog: "Blog",
	blog_featured: "Featured",
	blog_search: "Search posts…",
	blog_empty_h: "No posts yet",
	blog_empty_p: "The chapter blog is warming up. Check back soon.",
	blog_subscribe_h: "Never miss a post",
	blog_subscribe_p: "One email when we publish. No spam, no lists sold — ever.",
	blog_subscribe_cta: "Subscribe",
	blog_share: "Share",
	blog_copy_link: "Copy link",
	blog_email_it: "Email it",
	blog_read_next: "Read next",
	blog_get_involved_h: "Get involved",
	blog_get_involved_p: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	cal_title: "Event calendar",
	cal_crumb_calendar: "Calendar",
	cal_month: "Month",
	cal_list: "List",
	cal_empty_h: "Nothing scheduled this month",
	cal_empty_p: "Check the next month or subscribe below and never miss one.",
	cal_subscribe_h: "Subscribe to the calendar",
	cal_subscribe_p: "Add every meeting and action to your own calendar automatically.",
	cal_google: "Google Calendar",
	cal_ics: "iCal / .ics",
	event_rsvp: "RSVP",
	event_add_calendar: "Add to calendar",
	event_about: "About this event",
	event_details: "Details",
	event_date: "Date",
	event_time: "Time",
	event_location: "Location",
	event_save_h: "Save your spot",
	event_save_p: "RSVP and we’ll send the details straight to you.",
	event_save_cta: "RSVP Now",
	event_contact: "Questions? Contact",
	event_more: "More upcoming events",
	chrome_on_this_page: "On this page",
	chrome_related: "Related",
	chrome_document: "Document",
	chrome_what_covers: "What it covers",
	chrome_action: "Action",
	interior_documents: "Documents",
	interior_contact: "Contact",
	interior_contact_p: "Questions, ideas, or press —",
	interior_subscribe_h: "Never miss an update",
	interior_subscribe_p: "One email when something new lands — meetings, actions, and posts. No spam, ever.",
	interior_subscribe_cta: "Subscribe",
	about_dues_cta: "Update my dues",
	page_grievance_h: "Need to report something?",
	nf_doc_title: "Page not found",
	nf_title: "This page got organized out of existence",
	nf_lede: "The page you’re looking for isn’t here — it may have moved, or the link may be broken.",
	nf_home: "Back home",
	nf_calendar: "See the calendar"
};
var categories$2 = [
	{
		id: "chapter",
		label: "Chapter-Wide",
		color: "#B01B22"
	},
	{
		id: "poled",
		label: "Political Education",
		color: "#33518F"
	},
	{
		id: "mutual",
		label: "Mutual Aid",
		color: "#1B6B40"
	},
	{
		id: "labor",
		label: "Labor",
		color: "#8F5715"
	},
	{
		id: "electoral",
		label: "Electoral",
		color: "#6E3B87"
	},
	{
		id: "social",
		label: "Social",
		color: "#0A6B74"
	}
];
const siteFixture = {
	lang: lang$5,
	homeUrl: homeUrl$1,
	apiBase: apiBase,
	languages: languages$7,
	chapter: chapter,
	identity: identity,
	header: header,
	footer: footer,
	strings: strings,
	categories: categories$2
};

var lang$4 = "";
var id$5 = 0;
var path$4 = "/";
var hero = {
	subhead: "We’re fighting for the future our community deserves.",
	lede: "We’re a member-run organization building working-class power in our community.",
	cta_primary_label: "Join us",
	cta_primary_url: "/get-involved/#join",
	cta_secondary_label: "New member? Start with Progress Now 101. Sign up here",
	cta_secondary_url: "/get-involved/"
};
var who = {
	eyebrow: "Who we are",
	heading: "We are <span class=\"notranslate\">Progress Now</span>",
	p1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, quis nostrud exercitation ullamco laboris.",
	p2: "Ut enim ad minim veniam, quis nostrud.",
	p3: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis.<br>Lorem ipsum dolor sit amet.",
	link_label: "More about our chapter",
	link_url: "/about/"
};
var cta = {
	line: "Progress now, not someday!"
};
var eventCount = 5;
var events = [
	{
		day: "04",
		month: "JUL",
		title: "Contract Test Event",
		when: "Thursday, July 4 · 6:00 PM",
		where: "Downtown",
		url: "http://example.org/?event=contract-test-event"
	}
];
var calendarUrl$1 = "http://example.org/";
var blog = {
	featured: {
		cat: "chapter",
		cat_label: "Chapter-Wide",
		date: "June 1, 2026",
		read: "1 min read",
		title: "Contract Test Post",
		excerpt: "A deterministic excerpt.",
		url: "http://example.org/?p=0",
		image: null
	},
	rows: [
	]
};
var languages$6 = [
];
var seo$6 = {
	title: "Progress Now – Organizing our community.",
	description: "We’re a member-run organization building working-class power in our community.",
	canonical: "http://example.org/",
	robots: "index,follow",
	hreflang: [
	]
};
const frontFixture = {
	lang: lang$4,
	id: id$5,
	path: path$4,
	hero: hero,
	who: who,
	cta: cta,
	eventCount: eventCount,
	events: events,
	calendarUrl: calendarUrl$1,
	blog: blog,
	languages: languages$6,
	seo: seo$6
};

var lang$3 = "";
var id$4 = 0;
var path$3 = "/?page_id=0";
var kind$2 = "about";
var template$2 = "page-templates/about.php";
var title$4 = "About the Chapter";
var lede$2 = "";
var content$2 = "<p>About body.</p>\n";
var documents$2 = [
];
var grievance$2 = {
	show: true,
	body: ""
};
var newhere$2 = {
	heading: "Get involved",
	body: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	link_label: "Join Now",
	url: "/get-involved/#join",
	external: false
};
var about$2 = {
	mission: {
		visible: true,
		eyebrow: "What we believe",
		body: "We believe our economy should be built democratically, by and for working people — not by billionaires for profit."
	},
	chapter: {
		visible: true,
		heading: "About the Chapter",
		p1: "We are a member-run, member-funded organizing group. Our grassroots work focuses on labor organizing, mutual aid, and political education across our community.",
		p2: "Everything we do is member-led, member-funded, and open to anyone who wants to build a community that works for working people. We regularly host community meetings to share updates, plan campaigns, and hold political education lectures. If you’re a student, ask us about our campus branch.",
		photo: null,
		ctas: [
			{
				label: "Come to a meeting",
				url: "/calendar/",
				external: false
			},
			{
				label: "Get involved",
				url: "/get-involved/",
				external: false
			},
			{
				label: "Students",
				url: "/get-involved/",
				external: false
			}
		]
	},
	history: {
		visible: true,
		heading: "Mission & History",
		body: "We fight for a future where housing, healthcare, and a dignified living are guaranteed — and we believe the people who live and work in our community should be the ones deciding it. Our work centers on three pillars: labor organizing, mutual aid, and political education.",
		timeline: [
			{
				year: "1982",
				text: "Progress Now is founded as a member-run organizing project."
			},
			{
				year: "20XX",
				text: "Local organizers form an organizing committee and begin meeting. <em class=\"text-muted\">(Year and details to be filled in by the chapter.)</em>"
			},
			{
				year: "20XX",
				text: "The chapter is chartered as an official local chapter. <em class=\"text-muted\">(Year and details to be filled in by the chapter.)</em>"
			}
		]
	},
	counties: {
		visible: true,
		heading: "Where We Organize",
		intro: "One chapter, many communities. Wherever you are in our community, you’re covered — and if you can help us organize deeper in your neighborhood, we want to hear from you.",
		cards: [
			{
				name: "Central",
				cities: "Downtown · Midtown",
				note: "Home base — most meetings held here"
			},
			{
				name: "North",
				cities: "Northside · Uptown",
				note: ""
			},
			{
				name: "South",
				cities: "Southside · Riverside",
				note: ""
			},
			{
				name: "Campus",
				cities: "Student branch",
				note: ""
			}
		]
	},
	committees: {
		visible: true,
		heading: "Committees",
		intro: "Committees are where the work happens. Each one meets regularly and welcomes new members.",
		link: {
			label: "Join a committee",
			url: "/get-involved/#committees",
			external: false
		}
	},
	governance: {
		visible: true,
		heading: "Bylaws & Code of Conduct",
		intro: "The chapter is governed by its members through documents we debate and vote on together. Everything is public.",
		docs: [
			{
				title: "Chapter Bylaws",
				covers: "How the chapter runs: officers, elections, quorum, committees, and how decisions get made.",
				action: "Read",
				url: "/bylaws-code-of-conduct/#documents"
			},
			{
				title: "Code of Conduct",
				covers: "What we expect of each other in every chapter space — meetings, actions, and online.",
				action: "Read",
				url: "/bylaws-code-of-conduct/#documents"
			},
			{
				title: "Grievance Policy",
				covers: "How to report harm and how the chapter handles conflict, confidentially and fairly.",
				action: "Read",
				url: "/bylaws-code-of-conduct/#grievance"
			},
			{
				title: "Meeting Minutes",
				covers: "Records and resolutions from general meetings, available to all members.",
				action: "Browse",
				url: "/bylaws-code-of-conduct/#documents"
			}
		]
	},
	faq: {
		visible: true,
		heading: "FAQ",
		rows: [
			{
				question: "Do I have to be a member to come to events?",
				answer: "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you."
			},
			{
				question: "How much are dues?",
				answer: "Dues are sliding-scale — most folks pay a few dollars a month. No one is turned away for inability to pay."
			},
			{
				question: "How do I change my dues rate?",
				answer: "Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated."
			},
			{
				question: "I've never done anything political before. Is that okay?",
				answer: "More than okay — it's the norm. Most members joined without any organizing experience. Progress Now 101 exists exactly for this."
			},
			{
				question: "Can I participate without being publicly visible?",
				answer: "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously."
			},
			{
				question: "How much time does membership take?",
				answer: "As much or as little as you have. Some members show up to one event a month; others help lead committees."
			}
		]
	},
	dues: {
		visible: true,
		heading: "Switching your dues rate?",
		body: "Already a member and changing your dues rate? Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated."
	},
	nav: [
		{
			href: "#chapter",
			label: "About the Chapter"
		},
		{
			href: "#mission",
			label: "Mission & History"
		},
		{
			href: "#counties",
			label: "Where We Organize"
		},
		{
			href: "#committees",
			label: "Committees"
		},
		{
			href: "#bylaws",
			label: "Bylaws & Code of Conduct"
		},
		{
			href: "#faq",
			label: "FAQ"
		}
	]
};
var gi$2 = null;
var calendar$2 = null;
var languages$5 = [
];
var seo$5 = {
	title: "About the Chapter – Progress Now",
	description: "Organizing our community.",
	canonical: "http://example.org/?page_id=0",
	robots: "index,follow",
	hreflang: [
	]
};
const aboutFixture = {
	lang: lang$3,
	id: id$4,
	path: path$3,
	kind: kind$2,
	template: template$2,
	title: title$4,
	lede: lede$2,
	content: content$2,
	documents: documents$2,
	grievance: grievance$2,
	newhere: newhere$2,
	about: about$2,
	gi: gi$2,
	calendar: calendar$2,
	languages: languages$5,
	seo: seo$5
};

var lang$2 = "";
var id$3 = 0;
var path$2 = "/?page_id=0";
var kind$1 = "get_involved";
var template$1 = "page-templates/get-involved.php";
var title$3 = "Get involved";
var lede$1 = "";
var content$1 = "";
var documents$1 = [
];
var grievance$1 = {
	show: true,
	body: ""
};
var newhere$1 = {
	heading: "Get involved",
	body: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	link_label: "Join Now",
	url: "/get-involved/#join",
	external: false
};
var about$1 = null;
var gi$1 = {
	join: {
		visible: true,
		heading: "How to join",
		steps: [
			{
				title: "Become a member",
				body: "Sign up in a few minutes. Dues are sliding-scale — pay what you can, and <strong>no one is turned away for lack of funds</strong>.",
				link_label: "Join now →",
				href: "/get-involved/#join",
				external: true
			},
			{
				title: "Come to Progress Now 101",
				body: "Our intro session for new and curious folks — what we stand for, what our chapter is working on, and how to plug in. Offered virtually and in person, multiple times a month. You don't have to be a member yet to attend.",
				link_label: "Find a session →",
				href: "/calendar/",
				external: false
			},
			{
				title: "Get onboarded & plug in",
				body: "After 101, we'll add you to our WhatsApp and match you with a committee that fits your interests and capacity — whether that's an hour a month or a night a week.",
				link_label: "Browse committees ↓",
				href: "#committees",
				external: false
			}
		]
	},
	committees: {
		visible: true,
		heading: "Committees",
		intro: "Committees are where the work happens. Each one meets regularly and welcomes new members — reach out through the WhatsApp or at any general meeting."
	},
	channels: {
		visible: true,
		heading: "Communication channels",
		items: [
			{
				label: "WhatsApp",
				desc: "Our main channel — members receive an invite during onboarding",
				link_label: "",
				url: "",
				badge: "Members only",
				external: false
			},
			{
				label: "Email",
				desc: "Questions, press, and anything else",
				link_label: "Write us",
				url: "mailto:",
				badge: "",
				external: false
			}
		]
	},
	faq: {
		visible: true,
		heading: "Common questions",
		items: [
			{
				question: "Do I have to be a member to come to events?",
				answer: "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you. No pressure."
			},
			{
				question: "How much are dues?",
				answer: "Dues are sliding-scale — most folks pay a few dollars a month. If dues are a barrier, talk to us: no one is turned away for lack of funds."
			},
			{
				question: "I've never done anything political before. Is that okay?",
				answer: "More than okay — it's the norm. Most members joined without any organizing experience. Progress Now 101 exists exactly for this, and committees will teach you everything as you go."
			},
			{
				question: "Can I participate without being publicly visible?",
				answer: "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously. Talk to us about what you're comfortable with."
			},
			{
				question: "How much time does membership take?",
				answer: "As much or as little as you have. Some members show up to one event a month; others help lead committees. Capacity changes — that's fine. The work is a marathon, not a sprint."
			}
		]
	},
	card: {
		heading: "Ready right now?",
		body: "Membership takes five minutes, and dues are pay-what-you-can.",
		link_label: "Join us",
		url: "/get-involved/#join",
		external: false
	},
	related: [
		{
			label: "Event Calendar",
			url: "/calendar/",
			external: false
		},
		{
			label: "Bylaws & Code of Conduct",
			url: "/bylaws-code-of-conduct/",
			external: false
		},
		{
			label: "Mission & History",
			url: "/about/#mission",
			external: false
		}
	],
	nav: [
		{
			href: "#join",
			label: "How to join"
		},
		{
			href: "#committees",
			label: "Committees"
		},
		{
			href: "#channels",
			label: "Communication channels"
		},
		{
			href: "#faq",
			label: "Common questions"
		}
	]
};
var calendar$1 = null;
var languages$4 = [
];
var seo$4 = {
	title: "Get involved – Progress Now",
	description: "Organizing our community.",
	canonical: "http://example.org/?page_id=0",
	robots: "index,follow",
	hreflang: [
	]
};
const getInvolvedFixture = {
	lang: lang$2,
	id: id$3,
	path: path$2,
	kind: kind$1,
	template: template$1,
	title: title$3,
	lede: lede$1,
	content: content$1,
	documents: documents$1,
	grievance: grievance$1,
	newhere: newhere$1,
	about: about$1,
	gi: gi$1,
	calendar: calendar$1,
	languages: languages$4,
	seo: seo$4
};

var lang$1 = "";
var id$2 = 0;
var path$1 = "/?page_id=0";
var kind = "calendar";
var template = "page-templates/calendar.php";
var title$2 = "Event Calendar";
var lede = "";
var content = "";
var documents = [
];
var grievance = {
	show: true,
	body: ""
};
var newhere = {
	heading: "Get involved",
	body: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	link_label: "Join Now",
	url: "/get-involved/#join",
	external: false
};
var about = null;
var gi = null;
var calendar = {
	apiBase: "http://example.org/index.php?rest_route=/progressnow/v1",
	icsUrl: "http://example.org/?feed=chapter-events",
	googleCalUrl: "https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fexample.org%2F%3Ffeed%3Dchapter-events"
};
var languages$3 = [
];
var seo$3 = {
	title: "Event Calendar – Progress Now",
	description: "Organizing our community.",
	canonical: "http://example.org/?page_id=0",
	robots: "index,follow",
	hreflang: [
	]
};
const calendarFixture = {
	lang: lang$1,
	id: id$2,
	path: path$1,
	kind: kind,
	template: template,
	title: title$2,
	lede: lede,
	content: content,
	documents: documents,
	grievance: grievance,
	newhere: newhere,
	about: about,
	gi: gi,
	calendar: calendar,
	languages: languages$3,
	seo: seo$3
};

var posts = [
	{
		id: "17",
		title: "Contract Test Post",
		slug: "contract-test-post",
		cat: "chapter",
		date: "Jun 1, 2026",
		excerpt: "A deterministic excerpt.",
		bylineMode: "named",
		author: "",
		featured: false,
		readMinutes: 1,
		url: "http://example.org/?p=17",
		image: null
	}
];
var page = 1;
var perPage = 24;
var total = 1;
var totalPages = 1;
const postsFixture = {
	posts: posts,
	page: page,
	perPage: perPage,
	total: total,
	totalPages: totalPages
};

var title$1 = "Contract Test Post";
var dek = "";
var cat$1 = "chapter";
var date$1 = "June 1, 2026";
var readMinutes = 1;
var bylineMode = "named";
var author = "";
var authorAvatar = "https://secure.gravatar.com/avatar/?s=96&d=mm";
var committee = "";
var authorBio = "";
var committeeBio = "";
var featuredImage = {
	src: null,
	alt: "Contract Test Post"
};
var blocks = [
	{
		type: "prose",
		html: "<p>Deterministic body prose for the contract test.</p>"
	},
	{
		type: "pull_quote",
		quote: "Fixed quote.",
		attribution: "Fixture"
	}
];
var tags = [
];
var readNext = [
];
var showMetaRail = false;
var languages$2 = [
];
var seo$2 = {
	title: "Contract Test Post",
	description: "A deterministic excerpt.",
	canonical: "http://example.org/?p=14",
	robots: "index,follow",
	hreflang: [
	]
};
const singlePostFixture = {
	title: title$1,
	dek: dek,
	cat: cat$1,
	date: date$1,
	readMinutes: readMinutes,
	bylineMode: bylineMode,
	author: author,
	authorAvatar: authorAvatar,
	committee: committee,
	authorBio: authorBio,
	committeeBio: committeeBio,
	featuredImage: featuredImage,
	blocks: blocks,
	tags: tags,
	readNext: readNext,
	showMetaRail: showMetaRail,
	languages: languages$2,
	seo: seo$2
};

var lang = "";
var id$1 = 0;
var path = "/?event=contract-test-event";
var event = {
	title: "Contract Test Event",
	summary: "",
	cat: "chapter",
	date: "2030-07-04",
	time: "6:00–8:00 PM",
	doorsTime: "",
	locationType: "in-person",
	venue: "Union Hall",
	city: "Downtown",
	cost: "",
	rsvpRequired: false,
	rsvpUrl: "",
	capacity: null,
	directionsUrl: "https://maps.google.com/?q=Union%20Hall%2C%20Downtown",
	gcalUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Contract%20Test%20Event&dates=20300704T180000%2F20300704T200000&details=March%20at%20dawn.&location=Downtown%20%E2%80%94%20Union%20Hall&ctz=America%2FChicago",
	icsUrl: "",
	contact: {
		name: "",
		email: "",
		phone: ""
	},
	featuredImage: {
		src: null,
		alt: "Contract Test Event"
	},
	blocks: [
	]
};
var categories$1 = [
	{
		id: "chapter",
		label: "Chapter-Wide",
		color: "#B01B22"
	},
	{
		id: "poled",
		label: "Political Education",
		color: "#33518F"
	},
	{
		id: "mutual",
		label: "Mutual Aid",
		color: "#1B6B40"
	},
	{
		id: "labor",
		label: "Labor",
		color: "#8F5715"
	},
	{
		id: "electoral",
		label: "Electoral",
		color: "#6E3B87"
	},
	{
		id: "social",
		label: "Social",
		color: "#0A6B74"
	}
];
var related = [
];
var showRelated = true;
var homeUrl = "http://example.org/";
var calendarUrl = "http://example.org/";
var languages$1 = [
];
var seo$1 = {
	title: "Contract Test Event – Progress Now",
	description: "March at dawn.",
	canonical: "http://example.org/?event=contract-test-event",
	robots: "index,follow",
	hreflang: [
	]
};
const singleEventFixture = {
	lang: lang,
	id: id$1,
	path: path,
	event: event,
	categories: categories$1,
	related: related,
	showRelated: showRelated,
	homeUrl: homeUrl,
	calendarUrl: calendarUrl,
	languages: languages$1,
	seo: seo$1
};

var id = "20";
var date = "2026-07-04";
var time = "6:00–8:00 PM";
var cat = "chapter";
var title = "Contract Test Event";
var location = "Downtown — Union Hall";
var desc = "March at dawn.";
var url = "http://example.org/?p=20";
var gcalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Contract%20Test%20Event&dates=20260704T180000%2F20260704T200000&details=March%20at%20dawn.&location=Downtown%20%E2%80%94%20Union%20Hall&ctz=America%2FChicago";
const chapterEventFixture = {
	id: id,
	date: date,
	time: time,
	cat: cat,
	title: title,
	location: location,
	desc: desc,
	url: url,
	gcalUrl: gcalUrl
};

var categories = [
	{
		id: "chapter",
		label: "Chapter-Wide",
		color: "#B01B22"
	},
	{
		id: "poled",
		label: "Political Education",
		color: "#33518F"
	},
	{
		id: "mutual",
		label: "Mutual Aid",
		color: "#1B6B40"
	},
	{
		id: "labor",
		label: "Labor",
		color: "#8F5715"
	},
	{
		id: "electoral",
		label: "Electoral",
		color: "#6E3B87"
	},
	{
		id: "social",
		label: "Social",
		color: "#0A6B74"
	}
];
const categoriesFixture = {
	categories: categories
};

const MOCK_ORIGIN = "https://mock.example";
const MOCK_CONTENT_VERSION = 7;
const HOME = { en: "/", es: "/es/" };
const PAGES = [
  { lang: "en", path: "/blog/", slug: "blog", kind: "posts_index", template: "page.php", title: "Chapter Blog" },
  { lang: "en", path: "/about/", slug: "about", kind: "about", template: "page-templates/about.php", title: "About the Chapter" },
  { lang: "en", path: "/get-involved/", slug: "get-involved", kind: "get_involved", template: "page-templates/get-involved.php", title: "Get involved" },
  { lang: "en", path: "/calendar/", slug: "calendar", kind: "calendar", template: "page-templates/calendar.php", title: "Event Calendar" },
  { lang: "en", path: "/bylaws/", slug: "bylaws", kind: "page", template: "page.php", title: "Bylaws & Code of Conduct" },
  { lang: "es", path: "/es/blog/", slug: "blog", kind: "posts_index", template: "page.php", title: "Blog del cap\xEDtulo" },
  { lang: "es", path: "/es/acerca/", slug: "acerca", kind: "about", template: "page-templates/about.php", title: "Sobre el cap\xEDtulo" },
  { lang: "es", path: "/es/participa/", slug: "participa", kind: "get_involved", template: "page-templates/get-involved.php", title: "Participa" },
  { lang: "es", path: "/es/calendario/", slug: "calendario", kind: "calendar", template: "page-templates/calendar.php", title: "Calendario de eventos" }
];
const POST_SLUG = "contract-test-post";
const EVENT_SLUG = "contract-test-event";
function langOf(value) {
  return value === "es" ? "es" : "en";
}
function abs(path) {
  return `${MOCK_ORIGIN}${path}`;
}
function translationOf(lang, kind) {
  var _a, _b;
  if (kind === "front") return HOME[lang];
  if (kind === "post") return `${HOME[lang]}blog/${POST_SLUG}/`;
  if (kind === "event") return `${HOME[lang]}events/${EVENT_SLUG}/`;
  return (_b = (_a = PAGES.find((p) => p.lang === lang && p.kind === kind)) == null ? void 0 : _a.path) != null ? _b : HOME[lang];
}
function languages(lang, kind) {
  return ["en", "es"].map((code) => ({
    code,
    label: code.toUpperCase(),
    name: code === "en" ? "English" : "Espa\xF1ol",
    active: code === lang,
    url: abs(translationOf(code, kind))
  }));
}
function seo(base, lang, kind, path) {
  var _a;
  return {
    title: base.title,
    description: base.description,
    canonical: abs(path),
    robots: (_a = base.robots) != null ? _a : "index,follow",
    hreflang: ["en", "es"].map((code) => ({ lang: code, href: abs(translationOf(code, kind)) }))
  };
}
function mockRoutesManifest() {
  const routes = [];
  let id = 1;
  for (const lang of ["en", "es"]) {
    routes.push({ path: HOME[lang], kind: "front", lang, id: id++, template: "front-page", payloadKey: `front:${lang}` });
    for (const page of PAGES.filter((p) => p.lang === lang)) {
      routes.push({ path: page.path, kind: page.kind, lang, id: id++, template: page.template, payloadKey: `page:${lang}:${page.slug}` });
    }
    routes.push({ path: translationOf(lang, "post"), kind: "post", lang, id: id++, template: "single.php", payloadKey: `post:${lang}:${POST_SLUG}` });
    routes.push({ path: translationOf(lang, "event"), kind: "event", lang, id: id++, template: "single-event.php", payloadKey: `event:${lang}:${EVENT_SLUG}` });
  }
  return { routes, contentVersion: MOCK_CONTENT_VERSION, generatedAt: "2026-01-01T00:00:00+00:00" };
}
function mockSite(langValue) {
  const lang = langOf(langValue);
  const home = abs(HOME[lang]);
  return {
    ...siteFixture,
    lang,
    homeUrl: home,
    apiBase: `${MOCK_ORIGIN}/mock/v1`,
    languages: languages(lang, "front"),
    header: {
      ...siteFixture.header,
      homeUrl: home,
      navItems: [
        { label: lang === "es" ? "Calendario" : "Calendar", href: translationOf(lang, "calendar") },
        { label: "Blog", href: translationOf(lang, "posts_index") },
        { label: lang === "es" ? "Participa" : "Get Involved", href: translationOf(lang, "get_involved") }
      ],
      aboutItems: [
        { label: lang === "es" ? "Sobre el cap\xEDtulo" : "About the Chapter", href: translationOf(lang, "about") },
        { label: lang === "es" ? "Misi\xF3n e historia" : "Mission & History", href: `${translationOf(lang, "about")}#mission` },
        { label: "FAQ", href: `${translationOf(lang, "about")}#faq` }
      ]
    },
    categories: categoriesFixture.categories
  };
}
function mockFrontPage(langValue) {
  const lang = langOf(langValue);
  return {
    ...frontFixture,
    lang,
    path: HOME[lang],
    calendarUrl: abs(translationOf(lang, "calendar")),
    events: frontFixture.events.map((e) => ({ ...e, url: abs(translationOf(lang, "event")) })),
    blog: {
      ...frontFixture.blog,
      featured: frontFixture.blog.featured ? { ...frontFixture.blog.featured, url: abs(translationOf(lang, "post")) } : null,
      rows: [
        { cat: "labor", cat_label: "Labor", title: "Know your rights on the job", date: "May 12, 2026", url: abs(translationOf(lang, "post")), image: null },
        { cat: "mutual", cat_label: "Mutual Aid", title: "Community fridge: spring report", date: "April 30, 2026", url: abs(translationOf(lang, "post")), image: null }
      ]
    },
    languages: languages(lang, "front"),
    seo: seo(frontFixture.seo, lang, "front", HOME[lang])
  };
}
function mockPage(pathValue, langValue) {
  const lang = langOf(langValue);
  const slug = pathValue.replace(/^\/+|\/+$/g, "");
  const page = PAGES.find((p) => p.lang === lang && p.slug === slug);
  if (!page) return null;
  const base = page.kind === "about" ? aboutFixture : page.kind === "get_involved" ? getInvolvedFixture : page.kind === "calendar" ? calendarFixture : { ...calendarFixture, calendar: null, about: null, gi: null };
  const content = page.kind === "page" ? "<p>Our chapter is governed by its members. These documents spell out how we make decisions together, how we treat each other, and what to do when something goes wrong.</p>" : page.kind === "posts_index" ? "" : base.content;
  return {
    ...base,
    lang,
    id: 100 + PAGES.indexOf(page),
    path: page.path,
    kind: page.kind,
    template: page.template,
    title: page.title,
    content,
    documents: page.kind === "page" ? [{ title: "Chapter Bylaws", meta: "PDF \xB7 12 pages", url: `${MOCK_ORIGIN}/wp-content/uploads/bylaws.pdf` }] : [],
    calendar: page.kind === "calendar" ? { apiBase: `${MOCK_ORIGIN}/mock/v1`, icsUrl: `${MOCK_ORIGIN}/feed/chapter-events/`, googleCalUrl: "https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fmock.example%2Ffeed%2Fchapter-events%2F" } : null,
    languages: languages(lang, page.kind),
    seo: seo({ title: `${page.title} \u2013 Progress Now`, description: base.seo.description }, lang, page.kind, page.path)
  };
}
function mockPosts(query) {
  const lang = langOf(query.lang);
  const s = typeof query.s === "string" ? query.s.trim().toLowerCase() : "";
  const category = typeof query.category === "string" ? query.category : "";
  let posts = postsFixture.posts.map((p) => ({ ...p, url: abs(translationOf(lang, "post")) }));
  if (s) posts = posts.filter((p) => p.title.toLowerCase().includes(s));
  if (category && category !== "all") posts = posts.filter((p) => p.cat === category);
  return { ...postsFixture, posts, total: posts.length, totalPages: posts.length ? 1 : 0 };
}
function mockSinglePost(slug, langValue) {
  if (slug !== POST_SLUG) return null;
  const lang = langOf(langValue);
  const path = translationOf(lang, "post");
  return {
    ...singlePostFixture,
    languages: languages(lang, "post"),
    seo: seo(singlePostFixture.seo, lang, "post", path)
  };
}
function mockEvents(query) {
  const lang = langOf(query.lang);
  return {
    events: [{ ...chapterEventFixture, url: abs(translationOf(lang, "event")) }],
    categories: categoriesFixture.categories
  };
}
function mockSingleEvent(slug, langValue) {
  if (slug !== EVENT_SLUG) return null;
  const lang = langOf(langValue);
  const path = translationOf(lang, "event");
  return {
    ...singleEventFixture,
    lang,
    path,
    homeUrl: abs(HOME[lang]),
    calendarUrl: abs(translationOf(lang, "calendar")),
    languages: languages(lang, "event"),
    seo: seo(singleEventFixture.seo, lang, "event", path)
  };
}
function mockCategories() {
  return categoriesFixture;
}
function mockDispatch(path, query) {
  const segments = path.replace(/^\/+|\/+$/g, "").split("/");
  const [head, ...rest] = segments;
  switch (head) {
    case "site":
      return mockSite(query.lang);
    case "routes":
      return mockRoutesManifest();
    case "front-page":
      return mockFrontPage(query.lang);
    case "pages":
      return mockPage(rest.join("/"), query.lang);
    case "posts":
      return rest.length ? mockSinglePost(rest[0], query.lang) : mockPosts(query);
    case "events":
      return rest.length ? mockSingleEvent(rest[0], query.lang) : mockEvents(query);
    case "categories":
      return mockCategories();
    default:
      return null;
  }
}

const ____path__get = defineEventHandler((event) => {
  var _a;
  if (!useRuntimeConfig(event).public.mockApi) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  const path = (_a = getRouterParam(event, "path")) != null ? _a : "";
  const body = mockDispatch(path, getQuery(event));
  if (body === null) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { code: "progressnow_not_found", message: `No fixture for /${path}` }
    });
  }
  setResponseHeader(event, "Cache-Control", "no-store");
  return body;
});

export { ____path__get as default };
//# sourceMappingURL=_...path_.get.mjs.map
