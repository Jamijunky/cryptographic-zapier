"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Wallet, Workflow, Plug, ShieldCheck, Zap, Globe } from "lucide-react";

const features = [
  {
    title: "Multi-Wallet Monitoring",
    description: "Listen to MetaMask, Phantom, CoinGate and more. Track transactions, token transfers, and smart contract events in real-time.",
    icon: Wallet,
  },
  {
    title: "Visual Workflow Builder",
    description: "Zapier-style drag-and-drop interface. Connect triggers to actions without writing a single line of code.",
    icon: Workflow,
  },
  {
    title: "50+ Integrations",
    description: "Connect to Google Sheets, Gmail, Slack, Discord, databases, webhooks, and any API. Your crypto meets your stack.",
    icon: Plug,
  },
  {
    title: "Verifiable Execution",
    description: "Generate tamper-proof execution receipts and audit trails. Off-chain by default, on-chain when compliance requires it.",
    icon: ShieldCheck,
  },
  {
    title: "AI-Powered Actions",
    description: "Use OpenAI to generate personalized emails, analyze transactions, or make intelligent decisions in your workflows.",
    icon: Zap,
  },
  {
    title: "Multi-Chain Support",
    description: "Solana, Ethereum, Polygon, and more. One platform to automate across all major blockchain networks.",
    icon: Globe,
  },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="bg-black py-[150px] md:py-20 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-700 before:to-transparent">
      <h2 className="text-center text-[5rem] md:text-4xl text-white mb-6 font-bold">
        <span className="inline-block relative tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          CAPABILITIES
        </span>
      </h2>
      <p className="text-center text-xl text-[#666] mb-[80px] md:mb-[50px] max-w-[600px] mx-auto px-5">
        Everything you need to automate crypto workflows for fast-moving teams and compliance-sensitive businesses
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] md:grid-cols-1 gap-8 md:gap-6 max-w-[1400px] mx-auto px-10 md:px-5">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              className="relative bg-gradient-to-br from-[#0a0a0a] to-black border border-[#222] p-10 md:p-8 cursor-pointer transition-all duration-300 hover:border-white hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] group"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative z-[1]">
                <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/30">
                  <Icon className="w-8 h-8 text-[#888] transition-colors duration-500 group-hover:text-white" />
                </div>
                <h3 className="text-2xl text-white mb-3 font-semibold tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-base text-[#888] leading-relaxed">
                  {feature.description}
                </p>
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)] pointer-events-none"
                  animate={{
                    opacity: activeIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


