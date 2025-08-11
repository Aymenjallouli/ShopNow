import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const { t } = useTranslation();

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const faqData = [
    {
      category: t('faq.general', 'General'),
      questions: [
        {
          question: t('faq.q1.question', 'What is ShopNow?'),
          answer: t('faq.q1.answer', 'ShopNow is your trusted online shopping platform offering a wide range of high-quality products at competitive prices. We provide a seamless shopping experience with fast delivery and excellent customer service.')
        },
        {
          question: t('faq.q2.question', 'How do I create an account?'),
          answer: t('faq.q2.answer', "Creating an account is easy! Click on the 'Sign Up' button in the top right corner of our website, fill in your details, and verify your email address. You'll be ready to start shopping in minutes.")
        },
        {
          question: t('faq.q3.question', 'Is my personal information secure?'),
          answer: t('faq.q3.answer', 'Absolutely! We use industry-standard encryption and security measures to protect your personal information. Your data is never shared with third parties without your consent.')
        }
      ]
    },
    {
      category: t('faq.ordersShipping', 'Orders & Shipping'),
      questions: [
        {
          question: t('faq.q4.question', 'How can I track my order?'),
          answer: t('faq.q4.answer', "Once your order is shipped, you'll receive a tracking number via email. You can also track your orders by logging into your account and visiting the 'Order History' section in your profile.")
        },
        {
          question: t('faq.q5.question', 'What are your shipping options?'),
          answer: t('faq.q5.answer', 'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free standard shipping is available on orders over $50.')
        },
        {
          question: t('faq.q6.question', 'Do you ship internationally?'),
          answer: t('faq.q6.answer', 'Currently, we ship to 25+ cities domestically. International shipping will be available soon. Subscribe to our newsletter to be notified when international shipping launches.')
        },
        {
          question: t('faq.q7.question', 'Can I change or cancel my order?'),
          answer: t('faq.q7.answer', 'You can modify or cancel your order within 1 hour of placing it by contacting our customer service team. After this time, orders are processed and cannot be changed.')
        }
      ]
    },
    {
      category: t('faq.payments', 'Payments'),
      questions: [
        {
          question: t('faq.q8.question', 'What payment methods do you accept?'),
          answer: t('faq.q8.answer', 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through encrypted connections.')
        },
        {
          question: t('faq.q9.question', 'When will I be charged?'),
          answer: t('faq.q9.answer', "Your payment method will be charged immediately when you place your order. You'll receive a confirmation email with your receipt.")
        },
        {
          question: t('faq.q10.question', 'Are there any hidden fees?'),
          answer: t('faq.q10.answer', 'No! The price you see at checkout is the final price. This includes all taxes and fees. Shipping costs are clearly displayed before you complete your purchase.')
        }
      ]
    },
    {
      category: t('faq.returnsRefunds', 'Returns & Refunds'),
      questions: [
        {
          question: t('faq.q11.question', 'What is your return policy?'),
          answer: t('faq.q11.answer', 'We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Some items like personalized products may not be eligible for returns.')
        },
        {
          question: t('faq.q12.question', 'How do I return an item?'),
          answer: t('faq.q12.answer', "Contact our customer service team to initiate a return. We'll provide you with a return shipping label and instructions. Refunds are processed within 5-7 business days after we receive your return.")
        },
        {
          question: t('faq.q13.question', 'Who pays for return shipping?'),
          answer: t('faq.q13.answer', 'Return shipping is free for defective items or our errors. For other returns, a small return shipping fee may apply, which will be deducted from your refund.')
        }
      ]
    },
    {
      category: t('faq.accountProfile', 'Account & Profile'),
      questions: [
        {
          question: t('faq.q14.question', 'How do I reset my password?'),
          answer: t('faq.q14.answer', "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a reset link. Follow the instructions in the email to create a new password.")
        },
        {
          question: t('faq.q15.question', 'Can I update my account information?'),
          answer: t('faq.q15.answer', 'Yes! Log into your account and go to your profile page. You can update your personal information, shipping addresses, and payment methods anytime.')
        },
        {
          question: t('faq.q16.question', 'How do I delete my account?'),
          answer: t('faq.q16.answer', "If you wish to delete your account, please contact our customer service team. We'll be sad to see you go, but we'll help you with the account deletion process.")
        }
      ]
    },
    {
      category: t('faq.products', 'Products'),
      questions: [
        {
          question: t('faq.q17.question', 'How do I know if an item is in stock?'),
          answer: t('faq.q17.answer', "Product availability is shown on each product page. If an item is out of stock, you can sign up for notifications to be alerted when it's back in stock.")
        },
        {
          question: t('faq.q18.question', 'Do you offer product warranties?'),
          answer: t('faq.q18.answer', 'Many of our products come with manufacturer warranties. Warranty information is displayed on the product page. We also offer our own satisfaction guarantee on all purchases.')
        },
        {
          question: t('faq.q19.question', 'Can I get product recommendations?'),
          answer: t('faq.q19.answer', 'Yes! Our recommendation system suggests products based on your browsing history and purchases. You can also contact our customer service team for personalized recommendations.')
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-6">
              {t('faq.title', 'Frequently Asked Questions')}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              {t('faq.intro', "Find answers to common questions about ShopNow. Can't find what you're looking for? Contact our support team.")}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">{t('faq.quickNav', 'Quick Navigation')}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {faqData.map((category, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const element = document.getElementById(`category-${index}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 font-medium rounded-lg border border-emerald-200 hover:from-emerald-200 hover:to-emerald-100 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {category.category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} id={`category-${categoryIndex}`} className="scroll-mt-20">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {category.category}
                  </h2>
                  
                  <div className="space-y-4">
                    {category.questions.map((faq, questionIndex) => {
                      const globalIndex = categoryIndex * 10 + questionIndex;
                      return (
                        <div key={questionIndex} className="border border-slate-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleAccordion(globalIndex)}
                            className="w-full px-6 py-4 text-left bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold text-slate-800 pr-4">
                                {faq.question}
                              </h3>
                              <svg
                                className={`w-5 h-5 text-emerald-600 transition-transform duration-200 flex-shrink-0 ${
                                  openAccordion === globalIndex ? 'transform rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          
                          {openAccordion === globalIndex && (
                            <div className="px-6 py-4 bg-white border-t border-slate-200">
                              <p className="text-slate-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-100 to-slate-100 rounded-2xl p-8 shadow-xl border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">{t('faq.stillHaveQuestions', 'Still Have Questions?')}</h2>
              <p className="text-xl text-slate-600 mb-8">
                {t('faq.stillHaveQuestionsDesc', "Can't find the answer you're looking for? Our friendly customer support team is here to help!")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('faq.contactUs', 'Contact Us')}
                </a>
                <button className="inline-flex items-center gap-2 bg-white text-slate-800 px-8 py-4 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {t('faq.liveChat', 'Live Chat')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
