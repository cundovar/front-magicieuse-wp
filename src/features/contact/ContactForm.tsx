import { useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from 'lucide-react'
import { Button } from '../../shared/components/Button'
import './ContactForm.scss'

const API_BASE = import.meta.env.VITE_WP_BASE_URL || ''

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch(`${API_BASE}/wp-json/magicieuse/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Une erreur est survenue.')
      }
      setStatus('success')
      setFields({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  if (status === 'success') {
    return (
      <div className="contact-form__success">
        <CheckCircle2 size={20} aria-hidden="true" />
        <p>Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.</p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <label className="contact-form__label" htmlFor="cf-name">Nom *</label>
        <input
          id="cf-name"
          className="contact-form__input"
          type="text"
          name="name"
          value={fields.name}
          onChange={handleChange}
          required
          autoComplete="name"
        />
      </div>

      <div className="contact-form__row">
        <label className="contact-form__label" htmlFor="cf-email">Email *</label>
        <input
          id="cf-email"
          className="contact-form__input"
          type="email"
          name="email"
          value={fields.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
      </div>

      <div className="contact-form__row">
        <label className="contact-form__label" htmlFor="cf-subject">Sujet</label>
        <input
          id="cf-subject"
          className="contact-form__input"
          type="text"
          name="subject"
          value={fields.subject}
          onChange={handleChange}
        />
      </div>

      <div className="contact-form__row">
        <label className="contact-form__label" htmlFor="cf-message">Message *</label>
        <textarea
          id="cf-message"
          className="contact-form__textarea"
          name="message"
          value={fields.message}
          onChange={handleChange}
          rows={6}
          required
        />
      </div>

      {status === 'error' && (
        <p className="contact-form__error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{errorMsg}</span>
        </p>
      )}

      <Button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? (
          <>
            <LoaderCircle className="contact-form__spinner" size={18} aria-hidden="true" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send size={18} aria-hidden="true" />
            Envoyer
          </>
        )}
      </Button>
    </form>
  )
}
