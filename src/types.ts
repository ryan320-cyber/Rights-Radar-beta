export type UsageFrequency = 'once' | 'multiple' | 'unknown';

export interface WaitlistPayload {
  email: string;
  usageFrequency: UsageFrequency;
  interestTypes: {
    userResearch: boolean;
    legalSupport: boolean;
    pricingFeedback: boolean;
  };
  // Extended detailed questions for waitlist research
  pastDisruptions?: string[]; // e.g. ['delay_3h', 'cancellation', 'missed_connection', 'denied_boarding', 'none']
  pastClaimExperience?: string; // e.g. 'abandoned', 'airline_refused', 'agency_commission_35_50', 'success_alone'
  frequentAirlines?: string[]; // e.g. ['Air France / KLM', 'easyJet', 'Ryanair', 'Transavia', 'Lufthansa', 'Autre']
  annualFlightCount?: string; // '1-2', '3-6', '7+'
  preferredFeature?: string; // 'local_detection', 'instant_calculator', 'legal_demand_letter', 'prescription_alert'
  preferredPricingModel?: string; // 'flat_fee_9_14', 'annual_pass', 'free_basic_premium_dossier'
  feedbackOrFrustration?: string;
}

export interface FlightDisruption {
  id: string;
  flightCode: string;
  route: string;
  date: string;
  status: string;
  delay: string;
  eligible: boolean;
  estimatedAmount?: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  source: string;
  sourceType: string;
  isUnverified?: boolean;
}
