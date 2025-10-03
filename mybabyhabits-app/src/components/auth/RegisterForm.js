// components/auth/RegisterForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import Input from '../ui/Input';

// Google Icon component
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function RegisterForm({ onSuccess, redirectTo = '/dashboard' }) {
  const { t } = useTranslation();
  const { signUpWithGoogle, signUpWithEmail, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      await signUpWithGoogle();
      onSuccess?.();
    } catch (error) {
      setError(error.message || t('auth.errors.signup_failed'));
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError(t('auth.errors.required_fields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.errors.password_mismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.errors.password_too_short'));
      return;
    }

    if (!formData.acceptTerms) {
      setError(t('auth.errors.accept_terms'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signUpWithEmail(formData.email, formData.password, formData.fullName);
      onSuccess?.();
    } catch (error) {
      setError(error.message || t('auth.errors.signup_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.signup.title')}
          </h2>
          <p className="text-gray-600">
            {t('auth.signup.subtitle')}
          </p>
          <div className="mt-2 p-3 bg-primary-50 rounded-md">
            <p className="text-sm text-primary-700">
              🎉 {t('auth.signup.trial_offer')}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Google Sign Up Button */}
        <Button
          onClick={handleGoogleSignUp}
          variant="outline"
          size="lg"
          className="w-full mb-4 flex items-center justify-center gap-3"
          disabled={isSubmitting}
        >
          <GoogleIcon className="w-5 h-5" />
          {t('auth.signup.google')}
        </Button>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {t('auth.or')}
            </span>
          </div>
        </div>

        {/* Email Form Toggle */}
        {!showEmailForm ? (
          <Button
            onClick={() => setShowEmailForm(true)}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            {t('auth.signup.email')}
          </Button>
        ) : (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <Input
              name="fullName"
              type="text"
              label={t('auth.full_name')}
              placeholder={t('auth.full_name_placeholder')}
              value={formData.fullName}
              onChange={handleInputChange}
              required
              autoComplete="name"
            />

            <Input
              name="email"
              type="email"
              label={t('auth.email')}
              placeholder={t('auth.email_placeholder')}
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
            />

            <Input
              name="password"
              type="password"
              label={t('auth.password')}
              placeholder={t('auth.password_placeholder')}
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
              helperText={t('auth.password_requirements')}
            />

            <Input
              name="confirmPassword"
              type="password"
              label={t('auth.confirm_password')}
              placeholder={t('auth.confirm_password_placeholder')}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
            />

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-gray-700">
                  {t('auth.accept_terms_prefix')}{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    {t('auth.terms_of_service')}
                  </Link>
                  {' '}{t('auth.and')}{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    {t('auth.privacy_policy')}
                  </Link>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !formData.email || !formData.password || !formData.fullName || !formData.acceptTerms}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              {t('auth.signup.submit')}
            </Button>

            <Button
              type="button"
              onClick={() => setShowEmailForm(false)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              {t('auth.back')}
            </Button>
          </form>
        )}

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.signup.have_account')}{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.signin.title')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}