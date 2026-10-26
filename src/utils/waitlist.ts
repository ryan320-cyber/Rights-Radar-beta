import { WaitlistPayload } from '../types';

export const WAITLIST_ENDPOINT = '/api/waitlist';

// Client-side session set to prevent immediate accidental re-submits from same tab
const sessionSubmittedEmails = new Set<string>();

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

export interface WaitlistSubmissionResult {
  success: boolean;
  message: string;
  isDuplicate?: boolean;
}

export async function submitWaitlist(
  payload: WaitlistPayload
): Promise<WaitlistSubmissionResult> {
  const cleanEmail = (payload.email || '').trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return {
      success: false,
      message: 'Veuillez saisir une adresse email valide (ex. passager@domaine.fr).',
    };
  }

  if (!payload.usageFrequency) {
    return {
      success: false,
      message: 'Veuillez indiquer comment vous envisagez d’utiliser l’outil.',
    };
  }

  if (sessionSubmittedEmails.has(cleanEmail)) {
    return {
      success: false,
      isDuplicate: true,
      message: 'Cette adresse email a déjà été enregistrée au cours de cette session.',
    };
  }

  // Derive profile and preferences from payload
  const profile = payload.interestTypes?.userResearch
    ? 'chercheur_recherche'
    : payload.interestTypes?.legalSupport
    ? 'relecteur_juridique'
    : 'passager_frequent';

  const notificationPref = payload.preferredPricingModel || 'forfait_fixe';

  // Structured survey payload to preserve all user research answers
  const surveyData = {
    interestTypes: payload.interestTypes,
    pastDisruptions: payload.pastDisruptions || [],
    pastClaimExperience: payload.pastClaimExperience || null,
    frequentAirlines: payload.frequentAirlines || [],
    annualFlightCount: payload.annualFlightCount || null,
    preferredFeature: payload.preferredFeature || null,
    preferredPricingModel: payload.preferredPricingModel || null,
    feedbackOrFrustration: payload.feedbackOrFrustration || null,
  };

  // Primary source of truth: PostgreSQL backend endpoint
  try {
    const response = await fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        profile,
        frequency: payload.usageFrequency,
        notificationPref,
        surveyData,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 409 || data.isDuplicate) {
        sessionSubmittedEmails.add(cleanEmail);
        return {
          success: false,
          isDuplicate: true,
          message: 'Cette adresse email est déjà inscrite sur notre liste d’attente.',
        };
      }
      return {
        success: false,
        message: data.error || `Erreur serveur (${response.status}). Inscription non confirmée.`,
      };
    }

    if (data.success) {
      sessionSubmittedEmails.add(cleanEmail);
      return {
        success: true,
        message: 'Votre participation a bien été enregistrée avec succès. Merci pour vos réponses précieuses !',
      };
    }

    return {
      success: false,
      message: data.error || 'La confirmation d’enregistrement n’a pas pu être validée.',
    };
  } catch (netErr: any) {
    // If backend is unreachable, try secondary Firestore if initialized and user is online
    try {
      const { db } = await import('../lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      if (db) {
        await addDoc(collection(db, 'waitlist_submissions'), {
          email: cleanEmail,
          usageFrequency: payload.usageFrequency,
          profile,
          notificationPref,
          surveyData: JSON.stringify(surveyData),
          createdAt: new Date().toISOString(),
        });
        sessionSubmittedEmails.add(cleanEmail);
        return {
          success: true,
          message: 'Votre inscription a été sauvegardée avec succès sur le registre sécurisé.',
        };
      }
    } catch (firestoreErr) {
      // Both persistence paths failed
    }

    // STRICT NON-NEGOTIABLE RULE: NEVER claim success when persistence failed!
    return {
      success: false,
      message: 'Impossible de joindre le serveur d’enregistrement. Votre inscription n’a pas pu être enregistrée. Veuillez réessayer ultérieurement.',
    };
  }
}
