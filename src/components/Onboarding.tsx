import { useState } from "react";
/**
 * Onboarding component
 *
 * Presents a two-step onboarding flow to obtain user consent and
 * collect anonymous demographic information. The component persists
 * consent and demographics to `/api/onboarding` and calls `onComplete`
 * when finished.
 */
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [consentGiven, setConsentGiven] = useState(false);
  const [occupation, setOccupation] = useState("");
  const [ageRange, setAgeRange] = useState("");

  const totalSteps = 2;

  const handleConsentContinue = () => {
    if (consentGiven) {
      // persist consent to backend
      try {
        fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "consent", consent: "accepted", ts: new Date().toISOString(), userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "" }),
        }).catch(() => {});
      } catch (e) {}

      setCurrentStep(2);
    }
  };

  const handleDemographicContinue = () => {
    // send demographics to backend before finishing
    try {
      fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "demographics", occupation, ageRange, ts: new Date().toISOString(), userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "" }),
      }).catch(() => {});
    } catch (e) {}

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-black/40 p-6 pt-16">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm overflow-hidden border" style={{ borderColor: "var(--border)" }}>
      {/* Stepper */}
        <div className="border-b bg-white/60">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              {[1, 2].map((step) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  {/* Circle + Label */}
                  <div className="flex flex-col items-center">
                    <div style={{ width: 32, height: 32, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, transition: 'background-color 0.2s' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: step === currentStep ? 'var(--accent)' : step < currentStep ? 'var(--accent-strong)' : 'var(--muted-bg)',
                        color: step === currentStep || step < currentStep ? 'var(--foreground)' : 'var(--muted)'
                      }}>{step}</div>
                    </div>

                    <span className={`mt-2 text-sm`} style={{ color: step === currentStep ? 'var(--foreground)' : 'var(--muted)' }}>
                      {step === 1 ? "Consent" : "About You"}
                    </span>
                  </div>

                  {/* Connecting line */}
                  {step < totalSteps && (
                    <div style={{ flex: 1, height: 2, marginTop: 12, backgroundColor: step < currentStep ? 'var(--accent)' : 'var(--muted-bg)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Content */}
        <div className="w-full max-w-4xl">
            {currentStep === 1 && (
              <div className="bg-white p-8">
                <h1 className="text-2xl mb-6" style={{ color: 'var(--foreground)' }}>
                  Welcome to the Madison Book Library Chatbot
                </h1>
                
                <div className="space-y-4 mb-6">
                  <p style={{ color: 'var(--foreground)' }}>
                    I'm designed to help you quickly find books, articles, events, and other resources available through the Madison Library. I've learned from librarians, cataloging standards, and trusted information sources across the Madison Library system to give you accurate and helpful guidance.
                  </p>
                  
                    <h2 className="text-lg mt-6 mb-3" style={{ color: 'var(--foreground)' }}>
                      Disclaimer
                    </h2>

                    <p style={{ color: 'var(--foreground)' }}>
                      Before proceeding, please read and acknowledge the following:
                    </p>

                    <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--foreground)' }}>
                    <li>
                      This chat application is a helpful tool for discovering library materials, but it does not replace assistance from a professional librarian.
                    </li>
                    <li>
                      For detailed research help, account issues, or specialized inquiries, please contact a Madison Library staff member directly.
                    </li>
                    <li>
                      As with any AI tool, the information I provide may not be completely accurate or up-to-date.
                    </li>
                    <li>
                      The Madison Library is not responsible for any actions taken based on the information provided by this chatbot.
                    </li>
                    <li>
                      Questions and answers may be retained to improve this AI model. No private or personally identifying information is stored from your use of this tool.
                    </li>
                  </ul>
                  
                  <p className="text-gray-700 mt-4">
                    By clicking &quot;I Understand and Agree&quot;, you acknowledge that you have read, understood, and agreed to these terms.
                  </p>
                </div>

                <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="consent"
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked === true)}
                  />
                  <label
                    htmlFor="consent"
                    className="text-sm cursor-pointer leading-relaxed"
                    style={{ color: 'var(--foreground)' }}
                  >
                    I Understand and Agree
                  </label>
                </div>

                <Button
                  onClick={handleConsentContinue}
                  disabled={!consentGiven}
                  size="lg"
                  style={consentGiven ? { backgroundColor: 'var(--accent)', color: 'var(--foreground)', width: '100%' } : { backgroundColor: 'var(--accent)', opacity: 0.45, color: 'var(--foreground)', width: '100%' }}
                >
                  Continue
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg border p-8" style={{ borderColor: 'var(--border)' }}>
                <h1 className="text-2xl mb-2" style={{ color: 'var(--foreground)' }}>
                  Welcome to Madison Book Library
                </h1>
                <p style={{ color: 'var(--foreground)', marginBottom: 32 }}>
                  Before you begin, we'd like to collect some basic demographic
                  information to better serve our community. This information is
                  anonymous and helps us understand our users.
                </p>

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="text-sm mb-2 block" style={{ color: 'var(--foreground)' }}>
                      Occupation / Role
                    </label>
                    <Select value={occupation} onValueChange={setOccupation}>
                      <SelectTrigger className="w-full bg-white border hover:bg-sky-50 hover:border-sky-300 transition-colors">
                        <SelectValue placeholder="Select your occupation" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="student" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">Student</SelectItem>
                        <SelectItem value="teacher" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">Teacher/Educator</SelectItem>
                        <SelectItem value="researcher" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">Researcher</SelectItem>
                        <SelectItem value="professional" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">Professional</SelectItem>
                        <SelectItem value="librarian" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">Librarian</SelectItem>
                        <SelectItem value="other" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm mb-2 block" style={{ color: 'var(--foreground)' }}>
                      Age Range
                    </label>
                    <Select value={ageRange} onValueChange={setAgeRange}>
                      <SelectTrigger className="w-full bg-white border hover:bg-sky-50 hover:border-sky-300 transition-colors">
                        <SelectValue placeholder="Select your age range" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Under 18" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">Under 18</SelectItem>
                        <SelectItem value="18-24" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">18-24</SelectItem>
                        <SelectItem value="25-34" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">25-34</SelectItem>
                        <SelectItem value="35-44" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">35-44</SelectItem>
                        <SelectItem value="45-54" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">45-54</SelectItem>
                        <SelectItem value="55-64" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">55-64</SelectItem>
                        <SelectItem value="65+" className="cursor-pointer data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-900">65+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleDemographicContinue}
                  disabled={!occupation || !ageRange}
                  size="lg"
                  style={occupation && ageRange ? { backgroundColor: 'var(--accent)', color: 'var(--foreground)', width: '100%' } : { backgroundColor: 'var(--accent)', opacity: 0.45, color: 'var(--foreground)', width: '100%' }}
                >
                  Continue to Library
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}