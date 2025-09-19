"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export const HeroClient = () => {
  const financialSolutions = [
    "EMI SOLUTIONS",
    "ZERO INTEREST", 
    "FLEXIBLE PAYMENTS",
    "EDUCATION FINANCE",
    "AFFORDABLE FEES",
    "INSTANT APPROVAL",
    "SECURE PAYMENTS",
    "SMART FINANCE"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % financialSolutions.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [financialSolutions.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">
              Transform Education Finance with
            </span>
            <br />
            <div className="h-20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.8 }}
                  transition={{ 
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                  className="text-blue-600 font-extrabold block"
                >
                  {financialSolutions[currentIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Inspired by GreyQuest's commitment to accessible education, we provide{" "}
          <span className="font-semibold text-blue-600">zero-interest EMI solutions</span>{" "}
          that make quality education affordable for every student and family.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link
            href="/parent/onboarding"
            className="group bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-3 text-lg"
          >
            <Icon icon="material-symbols:family-restroom" className="text-2xl" />
            Get Started as Parent
            <Icon 
              icon="material-symbols:arrow-forward-ios" 
              className="text-lg group-hover:translate-x-1 transition-transform duration-300" 
            />
          </Link>
          
          <Link
            href="/onboarding/institution"
            className="group bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-3 text-lg"
          >
            <Icon icon="material-symbols:school" className="text-2xl" />
            Register Institution
            <Icon 
              icon="material-symbols:arrow-forward-ios" 
              className="text-lg group-hover:translate-x-1 transition-transform duration-300" 
            />
          </Link>
        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">0%</div>
            <div className="text-gray-600">Interest Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600">Secure Payments</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
};