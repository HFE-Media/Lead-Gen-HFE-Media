export const LEAD_STATUSES = ["new", "contacted", "interested", "demo_booked", "quoted", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const CALL_OUTCOMES = [
  "no_answer",
  "wrong_number",
  "gatekeeper",
  "existing_website",
  "not_interested",
  "call_back_later",
  "info_requested",
  "interested",
  "demo_booked",
  "quoted",
  "won",
  "lost"
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  demo_booked: "Demo Booked",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost"
};

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  no_answer: "No answer",
  wrong_number: "Wrong number",
  gatekeeper: "Gatekeeper",
  existing_website: "Existing website",
  not_interested: "Not interested",
  call_back_later: "Call back later",
  info_requested: "Info requested",
  interested: "Interested",
  demo_booked: "Demo booked",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost"
};

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.includes(value as LeadStatus);
}

export function isCallOutcome(value: string): value is CallOutcome {
  return CALL_OUTCOMES.includes(value as CallOutcome);
}
