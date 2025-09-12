"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export const FeaturesClient = () => {
  const features = [
    {
      icon: "material-symbols:family-restroom",
      title: "For Parents & Students",
      description: "Easy enrollment with zero-interest EMI options that make education accessible and affordable for every family.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: "material-symbols:school",
      title: "For Educational Institutions",
      description: "Streamlined fee management system with instant settlements and comprehensive reporting for better financial oversight.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: "material-symbols:security-rounded",
      title: "Bank-Grade Security",
      description: "Your financial data is protected with industry-leading encryption and security measures for complete peace of mind.",
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: "material-symbols:speed-rounded",
      title: "Instant Processing",
      description: "Lightning-fast application processing with real-time updates and notifications throughout your journey.",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Platform?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with the vision of making education accessible, we provide comprehensive solutions 
            for both educational institutions and families.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                <Icon icon={feature.icon} className="text-3xl text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            </motion.div>
          ))}
        </div>

        {/* Call-to-action section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Education Finance?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of families and institutions already benefiting from our zero-interest solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-2">
                <Icon icon="material-symbols:play-circle-outline" className="text-xl" />
                Watch Demo
              </button>
              <button className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-gray-900 transition-colors duration-300 flex items-center justify-center gap-2">
                <Icon icon="material-symbols:contact-support-outline" className="text-xl" />
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};