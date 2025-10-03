// components/pricing/PricingSection.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

// Icons
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default function PricingSection({ onSelectPlan, showTrialBanner = true }) {
  const { t } = useTranslation();
  const { user, isPremium, daysRemaining, isTrialing } = useAuth();
  const [billingPeriod, setBillingPeriod] = React.useState('monthly');

  const plans = [
    {
      id: 'free',
      name: t('pricing.free.name'),
      price: { monthly: 0, annually: 0 },
      description: t('pricing.free.description'),
      features: [
        t('pricing.free.features.one_baby'),
        t('pricing.free.features.basic_tracking'),
        t('pricing.free.features.offline_mode'),
        t('pricing.free.features.basic_analytics'),
        t('pricing.free.features.trial_days', { days: 30 })
      ],
      limitations: [
        t('pricing.free.limitations.one_baby_only'),
        t('pricing.free.limitations.no_sharing'),
        t('pricing.free.limitations.limited_export'),
        t('pricing.free.limitations.ads_after_trial')
      ],
      buttonText: isTrialing ? t('pricing.current_plan') : t('pricing.free.button')
    },
    {
      id: 'premium',
      name: t('pricing.premium.name'),
      price: { monthly: 9.99, annually: 99.99 },
      description: t('pricing.premium.description'),
      popular: true,
      features: [
        t('pricing.premium.features.unlimited_babies'),
        t('pricing.premium.features.multi_caregiver'),
        t('pricing.premium.features.advanced_analytics'),
        t('pricing.premium.features.full_export'),
        t('pricing.premium.features.priority_support'),
        t('pricing.premium.features.no_ads'),
        t('pricing.premium.features.voice_commands'),
        t('pricing.premium.features.custom_reminders'),
        t('pricing.premium.features.growth_charts'),
        t('pricing.premium.features.backup_restore')
      ],
      limitations: [],
      buttonText: isPremium ? t('pricing.current_plan') : t('pricing.premium.button')
    }
  ];

  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      // Free plan - redirect to sign up or dashboard
      if (!user) {
        window.location.href = '/register';
      } else {
        window.location.href = '/dashboard';
      }
      return;
    }

    // Premium plan - handle subscription
    onSelectPlan?.(planId, billingPeriod);
  };

  const getDiscountPercentage = () => {
    const monthlyTotal = plans[1].price.monthly * 12;
    const annualPrice = plans[1].price.annually;
    return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('pricing.title')}
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            {t('pricing.subtitle')}
          </p>

          {/* Trial Banner */}
          {showTrialBanner && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-primary-500 mr-2" />
                  <p className="text-primary-700 font-medium">
                    {t('pricing.trial_banner')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`relative px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('annually')}
                className={`relative px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  billingPeriod === 'annually'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('pricing.annually')}
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  -{getDiscountPercentage()}%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* User Status */}
        {user && (
          <div className="mt-8 max-w-md mx-auto">
            <div className={`p-4 rounded-lg ${
              isPremium ? 'bg-green-50 border border-green-200' : 
              isTrialing ? 'bg-blue-50 border border-blue-200' : 
              'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-center font-medium ${
                isPremium ? 'text-green-800' : 
                isTrialing ? 'text-blue-800' : 
                'text-yellow-800'
              }`}>
                {isPremium ? (
                  t('pricing.status.premium')
                ) : isTrialing ? (
                  t('pricing.status.trial', { days: daysRemaining })
                ) : (
                  t('pricing.status.expired')
                )}
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl shadow-lg ${
                plan.popular
                  ? 'border-2 border-primary-500 bg-white'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 text-sm font-medium rounded-full">
                    {t('pricing.most_popular')}
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>

                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      €{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annually}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="ml-2 text-gray-600">
                        /{billingPeriod === 'monthly' ? t('pricing.per_month') : t('pricing.per_year')}
                      </span>
                    )}
                  </div>
                  {billingPeriod === 'annually' && plan.price.monthly > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      €{(plan.price.annually / 12).toFixed(2)} {t('pricing.per_month_billed_annually')}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`mt-8 w-full ${
                    plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                  disabled={
                    (plan.id === 'free' && user && isTrialing) ||
                    (plan.id === 'premium' && isPremium)
                  }
                >
                  {plan.buttonText}
                </Button>

                {/* Features */}
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    {t('pricing.included')}
                  </h4>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {t('pricing.limitations')}
                    </h4>
                    <ul className="mt-4 space-y-3">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <XIcon className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            {t('pricing.all_plans_include')}{' '}
            <span className="font-medium">{t('pricing.core_features')}</span>
          </p>
          <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ {t('pricing.common.secure_data')}</span>
            <span>✓ {t('pricing.common.mobile_app')}</span>
            <span>✓ {t('pricing.common.regular_updates')}</span>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📱 {t('pricing.coming_soon.title')}
            </h3>
            <p className="text-gray-600">
              {t('pricing.coming_soon.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}