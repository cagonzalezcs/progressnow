import type { EventBlock } from "@/lib/schemas";

/* Sample data for the styleguide's site-component sections (design fixtures
 * only — production routes never fall back to these; openspec
 * island-empty-states § Styleguide retains fixtures). */
export const SAMPLE_WP_ORIGIN = "https://progressnow.test";

export const SAMPLE_FAQ = [
  {
    question: "Do I have to be a member to come to an event?",
    answer:
      "No. Every public event is open to everyone; some organizing meetings are members-only and say so.",
  },
  {
    question: "Is childcare available?",
    answer:
      "At most general meetings and larger events, yes — check the event's Good to know panel.",
  },
  {
    question: "How do I join a committee?",
    answer: "Come to the committee's next meeting or email the contact on the Get Involved page.",
  },
];

export const SAMPLE_EVENT_BLOCKS: EventBlock[] = [
  {
    type: "prose",
    html: "<p>Doors open at 6, program at 6:30. Bring a friend and a folding chair if you have one.</p>",
  },
  {
    type: "agenda",
    items: [
      { title: "6:00", desc: "Doors, food, sign-in" },
      { title: "6:30", desc: "Welcome & report-backs" },
      { title: "7:15", desc: "Breakouts by committee" },
      { title: "8:00", desc: "Close" },
    ],
  },
  {
    type: "good_to_know",
    items: [
      "Wheelchair accessible entrance on 2nd St.",
      "Childcare provided — RSVP so we can plan.",
      "Spanish interpretation available.",
    ],
  },
  {
    type: "a11y_note",
    html: '<p>Step-free entrance, accessible restroom, ASL on request 48 hours ahead. <a href="#">Questions?</a></p>',
  },
  { type: "map", address: "Union Hall, 123 Main St, Anytown" },
];

export const SAMPLE_LINKS = [
  { label: "Mission & history", href: `${SAMPLE_WP_ORIGIN}/about/#mission` },
  { label: "Committees", href: `${SAMPLE_WP_ORIGIN}/about/#committees` },
  { label: "Bylaws (PDF)", href: `${SAMPLE_WP_ORIGIN}/wp-content/uploads/bylaws.pdf` },
  { label: "National site", href: "https://example.org/", external: true },
];

export const SAMPLE_ROWS = [
  { label: "When", value: "Tuesday, Sep 16 · 6:00–8:00 pm" },
  { label: "Where", value: "Union Hall, 123 Main St" },
  { label: "Cost", value: "Free — donations welcome" },
];
