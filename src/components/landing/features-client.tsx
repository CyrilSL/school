"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

export const FeaturesClient = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* MyFee for Parents */}
        <div className="mb-20">
          <div className="flex items-center mb-8">
            <Icon icon="material-symbols:star" className="text-4xl text-yellow-500 mr-4" />
            <h2 className="text-3xl font-bold text-gray-900">MyFee for parents</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Experience the most <span className="text-blue-600">convenient, affordable and rewarding</span> mode of paying your education fees.
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Stay informed and never miss a payment with our user friendly and cost-effective options, coupled with convenient payment reminders.
              </p>

              {/* Benefits List */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Icon icon="material-symbols:check-circle" className="text-green-600 text-xl mr-3" />
                  <span className="text-gray-700">Options to convert Annual Fees into Zero Cost EMIs.</span>
                </li>
                <li className="flex items-center">
                  <Icon icon="material-symbols:check-circle" className="text-green-600 text-xl mr-3" />
                  <span className="text-gray-700">Instant Reconciliation with Your Educational Institute.</span>
                </li>
                <li className="flex items-center">
                  <Icon icon="material-symbols:check-circle" className="text-green-600 text-xl mr-3" />
                  <span className="text-gray-700">WhatsApp based reminders.</span>
                </li>
              </ul>

              <div className="space-x-4">
                <Link
                  href="/signup/parent"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Sign up today!
                </Link>
                <Link
                  href="/parent/apply"
                  className="inline-flex items-center border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Explore MyFee for Parents
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Icon icon="material-symbols:family-restroom" className="text-8xl text-blue-600 mx-auto" />
            </div>
          </div>
        </div>

        {/* MyFee for Institutes */}
        <div className="mb-20 bg-white rounded-2xl p-12">
          <div className="flex items-center mb-8">
            <Icon icon="material-symbols:star" className="text-4xl text-yellow-500 mr-4" />
            <h2 className="text-3xl font-bold text-gray-900">MyFee for Institutes</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center">
              <Icon icon="material-symbols:school" className="text-8xl text-blue-600 mx-auto" />
            </div>

            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Transform your fee collection
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Let us manage your fee collection activities, so you can focus on the education of India's youth!
              </p>

              {/* Features */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <Icon icon="material-symbols:payments" className="text-blue-600 text-2xl mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Upfront cashflow from MyFee on behalf of parents</h4>
                    <p className="text-gray-600">Allows parents to pay in instalments but we give you the full payment upfront.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Icon icon="material-symbols:credit-card" className="text-blue-600 text-2xl mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">One payment platform with 8+ payment options</h4>
                    <p className="text-gray-600">Give parents a rewarding experience by allowing multiple easy payment options</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Icon icon="material-symbols:auto-mode" className="text-blue-600 text-2xl mr-4 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Eliminate administrative hassles related to fee collection</h4>
                    <p className="text-gray-600">No more chasing the parent, every month, for timely fee collection. Set up auto debit.</p>
                  </div>
                </div>
              </div>

              <Link
                href="/signup/institution"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Explore MyFee for Institutes
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-blue-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Let's transform your institute's fee-collection process today!</h3>
          <Link
            href="/signup/institution"
            className="inline-flex items-center bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
          >
            Schedule a demo
          </Link>
        </div>
      </div>
    </section>
  );
};