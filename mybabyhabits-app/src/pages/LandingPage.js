// src/pages/LandingPage.js - VERSIÓN COMPLETA CON i18n
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import emailService from '../services/emailService';
import LanguageSelector from '../components/LanguageSelector';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) return;
    
    setNewsletterStatus('loading');
    
    try {
      await emailService.subscribeToNewsletter(newsletterEmail.trim(), 'landing_page');
      
      setNewsletterStatus('success');
      setNewsletterMessage(t('newsletter.success'));
      setNewsletterEmail('');
      
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterMessage('');
      }, 5000);
      
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage(t('newsletter.error'));
      
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterMessage('');
      }, 3000);
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-icon">👶</div>
            <span className="brand-text">MyBabyHabits</span>
          </div>
          
          <div className="nav-links">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}>
              {t('nav.features')}
            </a>
            <a href="#newsletter" onClick={(e) => { 
              e.preventDefault(); 
              document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' }); 
            }}>
              {t('nav.newsletter')}
            </a>
            <a href="#footer" onClick={(e) => { 
              e.preventDefault(); 
              document.querySelector('.landing-footer')?.scrollIntoView({ behavior: 'smooth' }); 
            }}>
              {t('nav.contact')}
            </a>
          </div>
          
          <div className="nav-buttons">
            <LanguageSelector className="nav-lang" />
            <button onClick={() => navigate('/login')} className="btn-ghost">
              {t('nav.signin')}
            </button>
            <button onClick={() => navigate('/register')} className="btn-primary">
              {t('nav.signup')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-container">
          <div className="hero-content">
            {/* Left content */}
            <div className="hero-text">
              <div className="hero-badge">
                <span className="badge-icon">⚡</span>
                <span>{t('hero.badge')}</span>
              </div>
              
              <h1 className="hero-title">
                <span className="title-normal">{t('hero.title.care')}</span>
                <br />
                <span className="title-gradient">{t('hero.title.love')}</span>
              </h1>
              
              <p className="hero-description">
                {t('hero.description')}
              </p>
              
              <div className="hero-buttons">
                <button onClick={() => navigate('/register')} className="btn-hero-primary">
                  <span className="btn-icon">⚡</span>
                  {t('hero.startFree')}
                  <span className="btn-arrow">→</span>
                </button>
                
                <button onClick={scrollToFeatures} className="btn-hero-secondary">
                  {t('hero.viewFeatures')}
                </button>
              </div>
              
              {/* Stats */}
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">{t('stats.families')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4.9 ⭐</div>
                  <div className="stat-label">{t('stats.rating')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">{t('stats.uptime')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">{t('stats.support')}</div>
                </div>
              </div>
            </div>
            
            {/* Right content - Phone mockup COMPLETO */}
            <div className="hero-phone-container">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="status-bar">
                    <span>9:41</span>
                    <div className="status-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot dim"></div>
                    </div>
                  </div>
                  
                  <div className="app-content">
                    <div className="app-header">
                      <span className="app-icon">👶</span>
                      <span className="app-title">Caring for Emma</span>
                    </div>
                    
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="card-icon">🍼</div>
                        <div className="card-value">3</div>
                        <div className="card-label">Feeds</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="card-icon">😴</div>
                        <div className="card-time">8h</div>
                        <div className="card-time">52m</div>
                        <div className="card-label">Sleep</div>
                      </div>
                    </div>
                    
                    <div className="feeding-section">
                      <div className="section-header">
                        <span className="section-icon">🍼</span>
                        <span className="section-title">Feeding</span>
                      </div>
                      
                      <div className="feeding-info">
                        <div className="info-line">
                          <span className="info-icon">📍</span>
                          <span>Last feed: left breast -</span>
                        </div>
                        <div className="info-suggestion">Suggestion: right</div>
                      </div>
                      
                      <div className="feeding-buttons">
                        <button className="feeding-btn">
                          <span className="btn-emoji">👈</span>
                          <span>Left</span>
                        </button>
                        <button className="feeding-btn suggested">
                          <span className="btn-emoji">👉</span>
                          <div className="btn-content">
                            <span>Right</span>
                            <span className="suggested-text">Suggested</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="floating-heart">💖</div>
                <div className="floating-shield">🛡️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              {t('features.title')}
              <span className="title-gradient">{t('features.titleGradient')}</span>
            </h2>
            <p className="features-description">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💖</div>
              <h3 className="feature-title">{t('features.smartTracking.title')}</h3>
              <p className="feature-description">
                {t('features.smartTracking.description')}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h3 className="feature-title">{t('features.familyCollaboration.title')}</h3>
              <p className="feature-description">
                {t('features.familyCollaboration.description')}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">{t('features.intelligentAnalytics.title')}</h3>
              <p className="feature-description">
                {t('features.intelligentAnalytics.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-header">
            <div className="newsletter-icon">📧</div>
            <h2 className="newsletter-title">{t('newsletter.title')}</h2>
          </div>
          
          <p className="newsletter-description">
            {t('newsletter.description')}
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <div className="form-group">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                required
                disabled={newsletterStatus === 'loading'}
                className="newsletter-input"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading' || !newsletterEmail.trim()}
                className="newsletter-button"
              >
                {newsletterStatus === 'loading' ? (
                  <>
                    <div className="spinner"></div>
                    {t('newsletter.subscribing')}
                  </>
                ) : (
                  t('newsletter.subscribe')
                )}
              </button>
            </div>
            
            {newsletterMessage && (
              <div className={`newsletter-message ${newsletterStatus}`}>
                {newsletterMessage}
              </div>
            )}
          </form>
          
          <div className="newsletter-note">
            {t('newsletter.note')}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">{t('cta.title')}</h2>
          <p className="cta-description">
            {t('cta.description')}
          </p>
          
          <div className="cta-buttons">
            <button onClick={() => navigate('/register')} className="cta-btn-primary">
              <span className="btn-icon">⚡</span>
              {t('cta.startNow')}
            </button>
            
            <button onClick={() => navigate('/login')} className="cta-btn-secondary">
              <span className="btn-icon">👥</span>
              {t('cta.haveAccount')}
            </button>
          </div>
          
          <p className="cta-note">
            {t('cta.note')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand-section">
              <div className="footer-brand">
                <div className="footer-icon">👶</div>
                <span className="footer-brand-text">MyBabyHabits</span>
              </div>
              <p className="footer-description">
                {t('footer.description')}
              </p>
            </div>
            
            <div className="footer-links-section">
              <h4 className="footer-section-title">{t('footer.product')}</h4>
              <ul className="footer-links">
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}>{t('footer.features')}</a></li>
                <li><a href="#newsletter" onClick={(e) => { 
                  e.preventDefault(); 
                  document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' }); 
                }}>{t('nav.newsletter')}</a></li>
                <li><a href="#footer">{t('footer.updates')}</a></li>
              </ul>
            </div>
            
            <div className="footer-links-section">
              <h4 className="footer-section-title">{t('footer.support')}</h4>
              <ul className="footer-links">
                <li><a href="mailto:hello@mybabyhabits.com">{t('footer.help')}</a></li>
                <li><a href="mailto:hello@mybabyhabits.com">{t('footer.contact')}</a></li>
                <li><a href="#newsletter" onClick={(e) => { 
                  e.preventDefault(); 
                  document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' }); 
                }}>{t('footer.community')}</a></li>
              </ul>
            </div>
            
            <div className="footer-links-section">
              <h4 className="footer-section-title">{t('footer.legal')}</h4>
              <ul className="footer-links">
                <li><a href="/privacy">{t('footer.privacy')}</a></li>
                <li><a href="/terms">{t('footer.terms')}</a></li>
                <li><a href="/cookies">{t('footer.cookies')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="footer-copyright">
              {t('footer.copyright')}
            </p>
            <div className="footer-social">
              <span className="social-text">{t('footer.follow')}</span>
              <div className="social-icons">
                <div className="social-icon">📘</div>
                <div className="social-icon">📸</div>
                <div className="social-icon">🐦</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;