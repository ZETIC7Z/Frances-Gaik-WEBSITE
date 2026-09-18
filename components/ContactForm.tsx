'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { site } from '@/config/siteData';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (msg: string, type: 'error' | 'success') => {
    setToast({ message: msg, type });
    window.setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (message.trim().length < 10) {
      showToast('Message must be at least 10 characters', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          _subject: `New message from ${name.trim()} via Dr. Frances Gaik website`,
          _template: 'table',
        }),
      });

      if (response.ok) {
        setName('');
        setEmail('');
        setMessage('');
        showToast('Thank you! Your message has been sent successfully.', 'success');
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      showToast(`Could not send message. Please email directly to ${site.email}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-card glass">
      <div className="contact-form-header">
        <span className="contact-form-dot" aria-hidden="true" />
        <h2 className="contact-form-title">Send Me a Message</h2>
      </div>

      <form onSubmit={handleSubmit} className="contact-form" noValidate>
        <div className="contact-form-field">
          <label htmlFor="contact-name" className="contact-form-label">
            Your Name
          </label>
          <input
            id="contact-name"
            type="text"
            className="contact-form-input"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="contact-form-field">
          <label htmlFor="contact-email" className="contact-form-label">
            Your Email
          </label>
          <input
            id="contact-email"
            type="email"
            className="contact-form-input"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="contact-form-field">
          <label htmlFor="contact-message" className="contact-form-label">
            Your Message
          </label>
          <textarea
            id="contact-message"
            className="contact-form-input contact-form-textarea"
            placeholder="Your Message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          className="contact-form-submit"
          disabled={isSubmitting}
          aria-label="Send Message"
        >
          {isSubmitting ? (
            <span>Sending...</span>
          ) : (
            <>
              <span>Send Message</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ transform: 'rotate(45deg)' }}
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`contact-toast ${toast.type === 'error' ? 'contact-toast--error' : 'contact-toast--success'}`}
            role="status"
            aria-live="polite"
          >
            {toast.type === 'success' ? (
              <span className="contact-toast-icon">✓</span>
            ) : (
              <span className="contact-toast-icon">!</span>
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}