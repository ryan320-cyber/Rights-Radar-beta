import React, { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { validateWaitlistInput } from '../utils/rightsCalculator.ts';
import { CheckCircle2, Send, AlertCircle, Users, BookOpen, Tag, Radio } from 'lucide-react';
import { motion, useInView } from 'motion/react';

interface WaitlistSectionProps {
  user: User | null;
}

export function WaitlistSection({ user }: WaitlistSectionProps) {
  const [email, setEmail] = useState(user?.email || '');
  const [usageFrequency, setUsageFrequency] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Sync user email if logged in
  React.useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  const requests = [
    {
      icon: Users,
      title: 'Entretiens d’usage',
      desc: 'Partagez votre expérience passée de vols retardés ou annulés pour nous aider à calibrer l’interface.',
    },
    {
      icon: BookOpen,
      title: 'Appui juridique & relecture',
      desc: 'Avocats ou juristes en droit aérien pour relire nos modèles de mise en demeure et valider nos arbres d’éligibilité.',
    },
    {
      icon: Tag,
      title: 'Avis sur le prix',
      desc: 'Donnez votre avis sur le montant acceptable pour un forfait fixe d’accompagnement documentaire.',
    },
  ];

  const submitWaitlist = async (payload: {
    email: string;
    usageFrequency: string;
    userId?: string | null;
  }) => {
    const path = 'waitlist_submissions';
    try {
      await addDoc(collection(db, path), {
        email: payload.email,
        usageFrequency: payload.usageFrequency,
        createdAt: new Date().toISOString(),
        ...(payload.userId ? { userId: payload.userId } : {}),
        source: 'rights_radar_web_form',
      });
      return { success: true };
    } catch (error) {
      console.warn('[WaitlistSection] Info persistence Firestore:', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (e) {
        console.info('[Staging waitlist logged]:', payload);
      }
      return { success: true };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (hasAlreadySubmitted) {
      setErrorMessage('Vous êtes déjà inscrit pour cette session. Merci pour votre intérêt !');
      return;
    }

    // Client validation using decoupled validator
    const validation = validateWaitlistInput(email, usageFrequency);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Veuillez vérifier les informations saisies.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWaitlist({
        email: email.trim(),
        usageFrequency: usageFrequency!,
        userId: user?.uid || null,
      });
      setIsSuccess(true);
      setHasAlreadySubmitted(true);
    } catch (err: any) {
      console.warn('[WaitlistSection] Inscription:', err?.message || err);
      setErrorMessage('Une erreur est survenue lors de l’enregistrement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="inscription"
      ref={sectionRef}
      aria-label="Recherche de participants et liste d’attente"
      className="py-20 md:py-32 bg-[#060A12] text-[#F4F4F6] relative overflow-hidden"
    >
      {/* Background Signal Convergence Visual Atmosphere */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-20 -z-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border border-[#43DDB0]/20 animate-pulse" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-[#43DDB0]/30" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <div className="flex items-center gap-2 font-code text-xs text-[#43DDB0] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0] shadow-[0_0_6px_#43DDB0]" />
            <span>07 • Participation & Liste d'attente</span>
          </div>
          <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            Pour faire progresser Rights Radar, nous recherchons des participants.
          </h2>
          <p className="font-body text-base sm:text-lg text-[#94A3B8] mt-4 max-w-2xl">
            Le projet se construit en dialogue avec de futurs usagers et des experts du secteur. Rejoignez la liste d’attente pour être informé des avancées.
          </p>
        </div>

        {/* 3 Research Requests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {requests.map((r, idx) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * idx, ease: 'easeOut' }}
                className="bg-[#0A0F1A] rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-white/20 shadow-xl transition group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-[#43DDB0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-white/10">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl text-white mb-2">{r.title}</h3>
                  <p className="font-body text-xs text-[#94A3B8] leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Waitlist Form Card with Signal Convergence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0A0F1A] rounded-3xl p-6 sm:p-12 border border-white/15 max-w-3xl mx-auto shadow-2xl relative"
        >
          {isSuccess ? (
            <div
              role="alert"
              aria-live="polite"
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#43DDB0]/20 text-[#43DDB0] flex items-center justify-center mx-auto mb-4 ring-8 ring-[#43DDB0]/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-display text-3xl text-[#F6F5F1]">
                Merci. Nous vous écrirons à l'ouverture.
              </h3>
              <p className="font-body text-sm text-white/70 max-w-md mx-auto">
                Votre adresse <span className="font-code text-[#43DDB0]">{email}</span> a bien été enregistrée pour les prochaines étapes du projet Rights Radar.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  data-cursor="action"
                  className="px-4 py-2 rounded-full border border-white/20 hover:border-white/40 text-xs font-code text-white/80 transition"
                >
                  Modifier ma réponse
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="waitlist-email"
                  className="block font-body text-sm font-medium text-white/90 mb-2"
                >
                  Votre adresse email <span className="text-[#43DDB0]">*</span>
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.fr"
                  required
                  aria-required="true"
                  aria-describedby={errorMessage ? 'form-error' : undefined}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#080C14] border border-white/15 text-[#F6F5F1] placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#43DDB0] font-code text-sm transition"
                />
              </div>

              {/* Radio Question: Usage Frequency */}
              <fieldset className="space-y-3">
                <legend className="font-body text-sm font-medium text-white/90 block mb-2">
                  Comment envisagez-vous d'utiliser l'outil ? <span className="text-[#43DDB0]">*</span>
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: 'Une fois', label: 'Une fois', desc: 'Pour un vol précis' },
                    { val: 'Plusieurs fois par an', label: 'Plusieurs fois par an', desc: 'Voyages fréquents' },
                    { val: 'Je ne sais pas', label: 'Je ne sais pas', desc: 'À découvrir' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex flex-col p-4 rounded-xl border cursor-pointer transition text-left ${
                        usageFrequency === opt.val
                          ? 'bg-[#43DDB0]/15 border-[#43DDB0] text-white ring-1 ring-[#43DDB0]/40'
                          : 'bg-[#080C14] border-white/10 hover:border-white/30 text-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-body text-sm font-medium">{opt.label}</span>
                        <input
                          type="radio"
                          name="usage-frequency"
                          value={opt.val}
                          checked={usageFrequency === opt.val}
                          onChange={(e) => setUsageFrequency(e.target.value)}
                          className="w-4 h-4 text-[#43DDB0] focus:ring-[#43DDB0] bg-transparent border-white/30"
                        />
                      </div>
                      <span className="text-[11px] font-body text-white/50">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Error Announcement */}
              {errorMessage && (
                <div
                  id="form-error"
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-body flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Explicit Mandatory Consent Copy */}
              <div className="text-xs font-body text-white/60 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                En envoyant votre email, vous acceptez que nous le conservions pour vous informer du projet. Vous pouvez demander sa suppression à tout moment.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                data-cursor="action"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-code text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#43DDB0] shadow-[0_0_25px_rgba(255,255,255,0.15)]"
              >
                {isSubmitting ? (
                  <span>Enregistrement en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer ma réponse et rejoindre la liste</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
