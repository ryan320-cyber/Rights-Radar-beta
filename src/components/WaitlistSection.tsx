import React, { useState } from 'react';
import { submitWaitlist } from '../utils/waitlist';
import { UsageFrequency, WaitlistPayload } from '../types';
import { Users, Scale, Tag, Send, CheckCircle, AlertCircle, Loader2, Plane, Clock, Shield, Sparkles, MessageSquare } from 'lucide-react';

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [usageFrequency, setUsageFrequency] = useState<UsageFrequency | ''>('');
  
  // Extended questions
  const [pastDisruptions, setPastDisruptions] = useState<string[]>([]);
  const [pastClaimExperience, setPastClaimExperience] = useState<string>('');
  const [frequentAirlines, setFrequentAirlines] = useState<string[]>([]);
  const [annualFlightCount, setAnnualFlightCount] = useState<string>('3-6');
  const [preferredFeature, setPreferredFeature] = useState<string>('local_detection');
  const [preferredPricingModel, setPreferredPricingModel] = useState<string>('flat_fee_9_14');
  const [feedbackOrFrustration, setFeedbackOrFrustration] = useState<string>('');

  const [interestTypes, setInterestTypes] = useState({
    userResearch: true,
    legalSupport: false,
    pricingFeedback: false,
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const toggleDisruption = (val: string) => {
    setPastDisruptions((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleAirline = (name: string) => {
    setFrequentAirlines((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usageFrequency) {
      setStatus('error');
      setMessage('Veuillez indiquer comment vous envisagez d’utiliser l’outil.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const payload: WaitlistPayload = {
      email,
      usageFrequency: usageFrequency as UsageFrequency,
      interestTypes,
      pastDisruptions,
      pastClaimExperience,
      frequentAirlines,
      annualFlightCount,
      preferredFeature,
      preferredPricingModel,
      feedbackOrFrustration: feedbackOrFrustration.trim() || undefined,
    };

    const res = await submitWaitlist(payload);

    if (res.success) {
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } else {
      setStatus('error');
      setMessage(res.message);
    }
  };

  return (
    <section
      id="inscription"
      className="py-24 bg-[#F4F1E9] text-[#07111F] border-t border-[#07111F]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#07111F]/60 block mb-2">
            07 — Enquête & Liste d'attente
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-tight">
            Pour faire progresser Rights Radar, nous recherchons des participants.
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#07111F]/70 mt-4 leading-relaxed font-light">
            Partagez vos habitudes de voyage et vos expériences passées pour co-concevoir un outil indépendant, 100% respectueux de la vie privée et sans commission abusive.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Why participate & Commitments */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-6 rounded-2xl bg-white border border-[#07111F]/10 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#35D9AE]/15 text-[#07111F]">
                  <Users className="w-5 h-5 text-[#07111F]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#07111F]">1. Recherche utilisateurs</h3>
              </div>
              <p className="font-sans text-sm text-[#07111F]/70 leading-relaxed">
                Tester nos maquettes interactives en avant-première et nous aider à calibrer la détection automatique de vos vols.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#07111F]/10 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#FFB84D]/15 text-[#07111F]">
                  <Scale className="w-5 h-5 text-[#07111F]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#07111F]">2. Relecture juridique</h3>
              </div>
              <p className="font-sans text-sm text-[#07111F]/70 leading-relaxed">
                Avocats, juristes en droit des transports ou voyageurs chevronnés souhaitant relire et valider nos modèles de mise en demeure.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#07111F]/10 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#35D9AE]/15 text-[#07111F]">
                  <Tag className="w-5 h-5 text-[#07111F]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#07111F]">3. Éthique tarifaire</h3>
              </div>
              <p className="font-sans text-sm text-[#07111F]/70 leading-relaxed">
                Aidez-nous à valider le modèle d'un forfait fixe accessible (9 € à 14 €) en rupture avec les 35% à 50% des intermédiaires commerciaux.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#07111F] text-[#F4F1E9] border border-white/10 shadow-sm">
              <div className="flex items-center gap-2 font-mono text-xs text-[#35D9AE] uppercase tracking-wider mb-2">
                <Shield className="w-4 h-4" />
                <span>Zéro revente de données</span>
              </div>
              <p className="font-sans text-xs text-[#A6B3C4] leading-relaxed">
                Vos réponses servent exclusivement à orienter les priorités de développement de Rights Radar. Aucun démarchage commercial.
              </p>
            </div>
          </div>

          {/* Right Column: Comprehensive Waitlist Form */}
          <div className="lg:col-span-8 bg-[#07111F] text-[#F4F1E9] p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Form Title */}
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#35D9AE] block mb-1">
                  Enquête Passagers • Accès Anticipé
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white">
                  Rejoindre la liste d'attente
                </h3>
              </div>

              {/* Question 1: Email (Mandatory) */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label htmlFor="waitlist-email" className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                  1. Votre adresse e-mail <span className="text-[#43DDB0]">*</span>
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.fr"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-[#E7E7E2]/20 text-[#F6F5F1] placeholder-[#5C626D] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#43DDB0] transition-all"
                />
              </div>

              {/* Question 2: Usage Frequency (Mandatory) */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                  2. Comment envisagez-vous d'utiliser l'outil ? <span className="text-[#43DDB0]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans text-sm">
                  {[
                    { id: 'once', label: 'Une seule fois (vol spécifique)' },
                    { id: 'multiple', label: 'Plusieurs fois par an' },
                    { id: 'unknown', label: 'Je ne sais pas encore' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setUsageFrequency(opt.id as UsageFrequency)}
                      className={`text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        usageFrequency === opt.id
                          ? 'bg-[#43DDB0]/15 border-[#43DDB0] text-[#43DDB0] shadow-[0_0_12px_rgba(67,221,176,0.15)]'
                          : 'bg-black/20 border-white/10 text-[#C3C7CF] hover:border-white/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Perturbations subies récemment */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                    3. Avez-vous subi l'une de ces perturbations au cours des 5 dernières années ?
                  </label>
                  <span className="text-[11px] font-mono text-[#9BA3AF]">Choix multiple</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-xs sm:text-sm">
                  {[
                    { id: 'delay_3h', label: 'Retard de vol > 3 heures à l’arrivée' },
                    { id: 'cancellation', label: 'Vol annulé moins de 14 jours avant' },
                    { id: 'missed_conn', label: 'Correspondance manquée due à un retard' },
                    { id: 'denied_boarding', label: 'Refus d’embarquement (surbooking)' },
                    { id: 'lost_luggage', label: 'Bagage retardé, détérioré ou perdu' },
                    { id: 'none', label: 'Aucune perturbation jusqu’à présent' },
                  ].map((item) => {
                    const isSelected = pastDisruptions.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleDisruption(item.id)}
                        className={`text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#43DDB0]/15 border-[#43DDB0] text-[#43DDB0]'
                            : 'bg-black/20 border-white/10 text-[#A0A6B2] hover:border-white/30'
                        }`}
                      >
                        <span className="mr-2">{isSelected ? '✓' : '+'}</span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 4: Expérience passée de réclamation */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                  4. Avez-vous déjà tenté de demander une indemnité auprès d'une compagnie ?
                </label>
                <div className="space-y-2 font-sans text-xs sm:text-sm">
                  {[
                    {
                      id: 'abandoned',
                      label: 'Non, j’ai abandonné face à la complexité ou au manque de temps',
                    },
                    {
                      id: 'rejected',
                      label: 'Oui, mais la compagnie a rejeté ou invoqué des "circonstances extraordinaires"',
                    },
                    {
                      id: 'agency',
                      label: 'Oui, via un intermédiaire commercial qui a prélevé 35 % à 50 % de commission',
                    },
                    {
                      id: 'success_solo',
                      label: 'Oui, j’ai réussi seul après de multiples échanges avec le service client',
                    },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setPastClaimExperience(opt.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${
                        pastClaimExperience === opt.id
                          ? 'bg-[#43DDB0]/15 border-[#43DDB0] text-[#43DDB0]'
                          : 'bg-black/20 border-white/10 text-[#A0A6B2] hover:border-white/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 5: Compagnies aériennes régulières */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                    5. Quelles compagnies aériennes empruntez-vous le plus souvent ?
                  </label>
                  <span className="text-[11px] font-mono text-[#9BA3AF]">Sélectionnez vos compagnies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Air France / KLM',
                    'easyJet',
                    'Ryanair',
                    'Transavia',
                    'Lufthansa Group',
                    'Vueling / Iberia',
                    'British Airways',
                    'Vols internationaux / Long-courrier',
                  ].map((airline) => {
                    const isSelected = frequentAirlines.includes(airline);
                    return (
                      <button
                        type="button"
                        key={airline}
                        onClick={() => toggleAirline(airline)}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#43DDB0] text-[#0E1219] font-bold shadow-sm'
                            : 'bg-white/10 text-[#C3C7CF] hover:bg-white/20'
                        }`}
                      >
                        {airline} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 6: Fonctionnalité prioritaire attendue */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                  6. Quelle fonctionnalité vous paraît la plus utile pour Rights Radar ?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans text-xs">
                  {[
                    {
                      id: 'local_detection',
                      title: 'Détection 100% locale',
                      desc: 'Scanner mes emails et billets sans qu’aucune donnée ne quitte mon appareil.',
                    },
                    {
                      id: 'instant_calculator',
                      title: 'Calculateur CE 261/2004',
                      desc: 'Estimer en 1 clic les 250 €, 400 € ou 600 € selon la distance et le retard.',
                    },
                    {
                      id: 'legal_demand_letter',
                      title: 'Mise en demeure prête à l’emploi',
                      desc: 'Générer la lettre officielle avec les articles de loi et la jurisprudence CJUE.',
                    },
                    {
                      id: 'prescription_alert',
                      title: 'Surveillance de prescription',
                      desc: 'Alerte pour réclamer sur les vols des 5 dernières années avant expiration.',
                    },
                  ].map((feat) => (
                    <button
                      type="button"
                      key={feat.id}
                      onClick={() => setPreferredFeature(feat.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        preferredFeature === feat.id
                          ? 'bg-[#43DDB0]/15 border-[#43DDB0] text-[#F6F5F1]'
                          : 'bg-black/20 border-white/10 text-[#9BA3AF] hover:border-white/30'
                      }`}
                    >
                      <div className="font-bold text-[#E7E7E2] mb-1">{feat.title}</div>
                      <div className="text-[11px] text-[#A0A6B2] leading-relaxed">{feat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 7: Modèle tarifaire préféré */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                  7. Quel modèle de tarification vous semble le plus juste ?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans text-xs">
                  {[
                    {
                      id: 'flat_fee_9_14',
                      label: 'Forfait fixe 9 € - 14 €',
                      desc: '0 % de commission prélevée sur votre indemnité.',
                    },
                    {
                      id: 'annual_pass',
                      label: 'Pass Annuel illimité (29 €)',
                      desc: 'Pour les voyageurs réguliers et familles.',
                    },
                    {
                      id: 'free_basic_premium_dossier',
                      label: 'Audit gratuit + Option dossier complet',
                      desc: 'Vérification gratuite, paiement si dossier juridique généré.',
                    },
                  ].map((pricing) => (
                    <button
                      type="button"
                      key={pricing.id}
                      onClick={() => setPreferredPricingModel(pricing.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        preferredPricingModel === pricing.id
                          ? 'bg-[#43DDB0]/15 border-[#43DDB0] text-[#F6F5F1]'
                          : 'bg-black/20 border-white/10 text-[#9BA3AF] hover:border-white/30'
                      }`}
                    >
                      <div className="font-bold text-[#E7E7E2] mb-1">{pricing.label}</div>
                      <div className="text-[11px] text-[#A0A6B2] leading-tight">{pricing.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 8: Commentaire libre ou mauvaise expérience */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label htmlFor="waitlist-feedback" className="block text-xs font-mono uppercase tracking-wider text-[#E7E7E2]">
                  8. Avez-vous une frustration particulière ou une suggestion à nous faire ? (Optionnel)
                </label>
                <textarea
                  id="waitlist-feedback"
                  rows={3}
                  value={feedbackOrFrustration}
                  onChange={(e) => setFeedbackOrFrustration(e.target.value)}
                  placeholder="Ex : Air France m'a répondu 4 mois plus tard en invoquant la météo alors que tous les autres avions décollaient..."
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-[#E7E7E2]/20 text-[#F6F5F1] placeholder-[#5C626D] font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#43DDB0] transition-all resize-none"
                />
              </div>

              {/* Consent and Privacy */}
              <p className="text-xs font-sans text-[#717885] leading-relaxed">
                En soumettant ce questionnaire, vous acceptez de recevoir des nouvelles sur le lancement de Rights Radar. Vos réponses sont strictement confidentielles et ne seront jamais partagées avec des tiers ni des compagnies aériennes.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#35D9AE] text-[#03070D] font-mono text-sm font-bold hover:bg-[#2fc29b] disabled:opacity-50 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_0_25px_rgba(53,217,174,0.3)] focus:outline-none focus:ring-2 focus:ring-[#35D9AE]"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement de vos réponses...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer mes réponses & m'inscrire sur la liste d'attente</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Feedback Live Region */}
              <div aria-live="polite" className="pt-2">
                {status === 'success' && (
                  <div className="p-4 rounded-2xl bg-[#35D9AE]/15 border border-[#35D9AE] text-[#35D9AE] text-sm font-mono flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-2xl bg-[#FFB84D]/15 border border-[#FFB84D] text-[#FFB84D] text-sm font-mono flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
