// src/services/emailService.js
class EmailService {
    async subscribeToNewsletter(email, source = 'landing_page') {
      try {
        const subscribers = JSON.parse(localStorage.getItem('mybabyhabits_subscribers') || '[]');
        const newSubscriber = {
          id: Date.now(),
          email: email.trim(),
          timestamp: new Date().toISOString(),
          source,
          status: 'pending_approval',
          approved: false
        };
        
        subscribers.push(newSubscriber);
        localStorage.setItem('mybabyhabits_subscribers', JSON.stringify(subscribers));
        
        // Simular notificación al admin
        console.log('📧 New subscription for hello@mybabyhabits.com:', {
          email: newSubscriber.email,
          timestamp: newSubscriber.timestamp,
          source: newSubscriber.source
        });
        
        return { success: true, subscriber: newSubscriber };
      } catch (error) {
        console.error('Error in email service:', error);
        throw error;
      }
    }
  }
  
  export default new EmailService();