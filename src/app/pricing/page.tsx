"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { TiltCard } from "@/components/ui/tilt-card";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      description: "Explore the platform with limited audits.",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        "3 website audits per month",
        "Basic brand intelligence report",
        "Screenshot capture & evidence",
        "Executive summary & score cards",
        "Community support",
      ],
      cta: "Get Started Free",
      href: "/",
      isPopular: false,
    },
    {
      name: "Pro",
      description: "For freelancers, founders, and growth marketers who need deeper insight.",
      price: {
        monthly: 19,
        yearly: 15,
      },
      features: [
        "Unlimited website audits",
        "Full strategic dossier reports",
        "Competitor comparison matrix",
        "Action plan with timelines",
        "Report library & archives",
        "Priority analysis queue",
      ],
      cta: "Start Pro Trial",
      href: "/login",
      isPopular: true,
    },
    {
      name: "Agency",
      description: "For studios and agencies running audits at scale for clients.",
      price: {
        monthly: 49,
        yearly: 39,
      },
      features: [
        "Everything in Pro",
        "White-label PDF exports",
        "Team workspace (up to 10 seats)",
        "Client-ready branded reports",
        "API access for integrations",
        "Dedicated account support",
      ],
      cta: "Contact Sales",
      href: "mailto:hello@creativeintelligence.studio",
      isPopular: false,
    },
  ];

  return (
    <AppLayout>
      {/* Main Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 z-10 w-full max-w-[1200px] mx-auto relative">

        {/* Page Header */}
        <div className="text-center z-10 mb-16 max-w-[700px] relative">
          <span className="text-[12px] font-semibold tracking-wider text-[#86868b] uppercase block mb-3">
            Pricing
          </span>
          <h1 className="text-[40px] sm:text-[56px] font-bold tracking-tight leading-[1.1] text-[#f5f5f7]">
            Simple, transparent pricing.
          </h1>
          <p className="text-[16px] sm:text-[18px] text-[#86868b] max-w-[520px] leading-relaxed mt-4 mx-auto">
            Start free, upgrade when you need deeper intelligence and unlimited audits.
          </p>
        </div>

        {/* Yearly / Monthly Toggle Switch */}
        <div className="z-10 flex items-center justify-center gap-4 mb-12">
          <span className={`text-[12px] font-medium tracking-wider uppercase transition-colors ${billingPeriod === "monthly" ? "text-white" : "text-white/40"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="w-14 h-7 bg-white/[0.06] border border-white/10 rounded-full p-1 relative flex items-center cursor-pointer transition-colors hover:border-white/20"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
                billingPeriod === "yearly" ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-[12px] font-medium tracking-wider uppercase transition-colors ${billingPeriod === "yearly" ? "text-white" : "text-white/40"}`}>
              Yearly
            </span>
            <span className="px-2 py-0.5 bg-green-500/10 border border-green-400/30 text-green-400 text-[9px] font-semibold rounded-full uppercase tracking-wider">
              Save 20%
            </span>
          </div>
        </div>

        {/* Plans Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full z-10">
          {plans.map((plan, index) => {
            const isPro = plan.isPopular;
            const priceVal = billingPeriod === "yearly" ? plan.price.yearly : plan.price.monthly;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard
                  className={`flex flex-col justify-between p-8 sm:p-10 rounded-2xl min-h-[520px] relative transition-all duration-500 ${
                    isPro ? "glass-card-glow" : "glass-card"
                  }`}
                  maxTilt={5}
                  hoverScale={1.01}
                >
                {/* Upper Details */}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[12px] font-semibold tracking-wider text-[#86868b] uppercase block">
                        {plan.name}
                      </span>
                      <h2 className="text-[36px] sm:text-[42px] font-bold text-[#f5f5f7] tracking-tight leading-none mt-1">
                        {plan.price.monthly === 0 ? "Free" : `$${priceVal}`}
                        {plan.price.monthly !== 0 && (
                          <span className="text-[14px] text-[#86868b] tracking-normal font-normal">
                            /mo
                          </span>
                        )}
                      </h2>
                    </div>
                    {isPro && (
                      <span className="px-3 py-1 bg-white/10 border border-white/20 text-white rounded-full text-[10px] font-semibold tracking-wider uppercase">
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] sm:text-[14px] text-[#86868b] leading-relaxed mb-8">
                    {plan.description}
                  </p>

                  {/* Divider Line */}
                  <div className="h-[1px] bg-white/[0.08] w-full mb-8" />

                  {/* Feature list */}
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[13px] sm:text-[14px] text-white/70">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA button */}
                <a
                  href={plan.href}
                  className={`mt-10 w-full py-3.5 rounded-full text-[13px] font-semibold tracking-wide text-center block transition-all duration-300 ${
                    isPro 
                      ? "bg-gradient-to-b from-white to-[#e2e2e7] text-[#1d1d1f] border border-white/20 shadow-sm hover:brightness-95 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" 
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.cta}
                </a>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
