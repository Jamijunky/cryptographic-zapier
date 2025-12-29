"use client";
import { motion } from "framer-motion";
import { Wallet, Zap, Shield } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-[#222] pt-[100px] pb-[50px] md:pt-[60px] md:pb-[30px]">
      <div className="max-w-[1400px] mx-auto px-10 md:px-5">
        <motion.div
          className="mb-[60px] md:mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-4xl md:text-[2rem] font-bold text-white tracking-tight block mb-2.5">
            ZYNTHEX
          </span>
          <p className="text-[#666] text-base max-w-md">
            The automation platform for crypto. Connect blockchain payments to your business workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] md:grid-cols-2 gap-[60px] md:gap-10 mb-20 md:mb-[50px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white text-lg font-semibold mb-5">Product</h3>
            <ul className="list-none p-0 space-y-3">
              <li><a href="#features" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Features</a></li>
              <li><a href="#integrations" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Integrations</a></li>
              <li><a href="#pricing" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Pricing</a></li>
              <li><a href="#changelog" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Changelog</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white text-lg font-semibold mb-5">Resources</h3>
            <ul className="list-none p-0 space-y-3">
              <li><a href="#docs" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Documentation</a></li>
              <li><a href="#api" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">API Reference</a></li>
              <li><a href="#templates" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Templates</a></li>
              <li><a href="#guides" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Guides</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white text-lg font-semibold mb-5">Legal</h3>
            <ul className="list-none p-0 space-y-3">
              <li><a href="/privacy" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Terms of Service</a></li>
              <li><a href="/acceptable-use" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Acceptable Use</a></li>
              <li><a href="#security" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Security</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white text-lg font-semibold mb-5">Community</h3>
            <ul className="list-none p-0 space-y-3">
              <li><a href="#twitter" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Twitter / X</a></li>
              <li><a href="#discord" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Discord</a></li>
              <li><a href="#github" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">GitHub</a></li>
              <li><a href="#telegram" className="text-[#666] no-underline transition-colors duration-300 text-sm hover:text-white">Telegram</a></li>
            </ul>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-12 py-8 border-y border-[#1a1a1a]">
          <div className="flex items-center gap-2 text-[#555]">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Multi-chain support</span>
          </div>
          <div className="flex items-center gap-2 text-[#555]">
            <Zap className="w-4 h-4" />
            <span className="text-sm">50+ integrations</span>
          </div>
          <div className="flex items-center gap-2 text-[#555]">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Verifiable execution</span>
          </div>
        </div>

        <div className="flex justify-between items-center md:flex-col md:gap-5 md:text-center">
          <p className="text-[#555] text-sm">© {currentYear} Zynthex. All rights reserved.</p>
          <p className="text-[#444] text-xs">Built for crypto teams and compliance-sensitive businesses</p>
        </div>
      </div>
    </footer>
  );
}


