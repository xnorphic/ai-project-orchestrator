import type { ClarifyingQuestion, PRD } from "@/types";

/**
 * Demo file #1 — a feature-launch project that exercises every role:
 * Product, Design, Engineering, DevOps, QA, and Business.
 *
 * Used by the "Load the demo project" shortcut so the whole flow can be
 * explored without any API keys.
 */

export const demoIdea =
  "We want to launch a Smart In-App Wallet with tap-to-pay so Careem users " +
  "can store balance, link cards, and pay at partner merchants by tapping " +
  "their phone. It should feel instant, be secure, and roll out across the GCC.";

export const demoPRD: PRD = {
  title: "Smart In-App Wallet & Tap-to-Pay",
  oneLiner:
    "Let Careem users store balance, link cards, and tap-to-pay at partner merchants.",
  problemStatement:
    "Users currently juggle physical cards and cash for everyday partner " +
    "purchases. There is no fast, secure, native way to pay in person using " +
    "the Careem app, which limits engagement with the broader super-app and " +
    "leaves merchant payment volume on the table.",
  goals: [
    "Enable stored balance top-up and card linking inside the app",
    "Support contactless tap-to-pay at partner POS terminals",
    "Achieve sub-2-second payment confirmation",
    "Launch across UAE, KSA, and Egypt in the first wave",
  ],
  nonGoals: [
    "Issuing physical cards",
    "Peer-to-peer money transfer (later phase)",
    "International remittance",
  ],
  targetUsers: [
    "Frequent Careem riders who also use partner merchants",
    "Users in cash-heavy markets seeking a digital wallet",
    "Partner merchants wanting faster checkout",
  ],
  userStories: [
    {
      persona: "a returning rider",
      want: "top up my wallet and tap my phone to pay at a partner cafe",
      soThat: "I skip cards and cash for small daily purchases",
    },
    {
      persona: "a security-conscious user",
      want: "authenticate each tap with biometrics",
      soThat: "I trust my money is safe if I lose my phone",
    },
    {
      persona: "a partner merchant",
      want: "accept Careem wallet payments on my existing NFC terminal",
      soThat: "I close sales faster without new hardware",
    },
  ],
  functionalRequirements: [
    "Wallet balance storage with top-up via linked card or bank",
    "Secure card tokenization and vaulting (PCI-DSS scope)",
    "NFC tap-to-pay at EMV-compatible partner terminals",
    "Biometric / PIN step-up authentication per transaction threshold",
    "Real-time transaction ledger and receipts",
    "Refunds and dispute initiation flow",
  ],
  nonFunctionalRequirements: [
    "p95 payment confirmation under 2 seconds",
    "99.95% availability for the payment path",
    "PCI-DSS and local central-bank compliance",
    "Graceful offline-to-online reconciliation",
  ],
  successMetrics: [
    "30% of active users link a payment method within 60 days",
    "1M tap-to-pay transactions per month by quarter-end",
    "Payment success rate above 99.5%",
    "Fraud loss below 8 basis points of volume",
  ],
  assumptions: [
    "Partner terminals already support contactless EMV",
    "Central-bank approval is achievable within the launch window",
    "Existing Careem Pay ledger can be extended rather than rebuilt",
  ],
  openRisks: [
    "Regulatory approval timing varies by market",
    "Fraud exposure during early rollout",
    "Dependency on partner POS firmware versions",
  ],
};

export const demoQuestions: ClarifyingQuestion[] = [
  {
    id: "markets",
    question: "Which markets are in the first launch wave?",
    why: "Each market adds regulatory review, localization, and partner onboarding work.",
    options: ["UAE only", "UAE + KSA", "UAE + KSA + Egypt", "All GCC at once"],
    recommended: "UAE + KSA",
  },
  {
    id: "auth",
    question: "What authentication should gate each payment?",
    why: "Stronger auth lowers fraud but adds friction and engineering scope.",
    options: [
      "PIN only",
      "Biometric only",
      "Biometric with PIN fallback",
      "Risk-based step-up",
    ],
    recommended: "Biometric with PIN fallback",
  },
  {
    id: "ledger",
    question: "Build a new ledger or extend Careem Pay's?",
    why: "Reuse is faster and cheaper but inherits existing constraints.",
    options: ["Extend Careem Pay ledger", "Build new ledger service"],
    recommended: "Extend Careem Pay ledger",
  },
  {
    id: "compliance",
    question: "How should compliance review be sequenced?",
    why: "Front-loading compliance avoids late-stage rework but slows the start.",
    options: [
      "Parallel with build",
      "Gate before launch only",
      "Front-loaded before build",
    ],
    recommended: "Parallel with build",
  },
];
