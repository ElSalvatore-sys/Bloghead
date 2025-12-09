import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacy: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitStatus('success')
    setIsSubmitting(false)
    setFormData({ name: '', email: '', subject: '', message: '', privacy: false })

    // Reset status after 5 seconds
    setTimeout(() => setSubmitStatus('idle'), 5000)
  }

  return (
    <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left Side - Contact Info */}
            <div className="lg:col-span-5">
              {/* Title */}
              <div className="mb-8">
                <h1 className="font-display text-5xl md:text-7xl text-white italic mb-4">
                  Kontakt
                </h1>
                <div
                  className="h-1 w-32 md:w-40"
                  style={{
                    background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 100%)'
                  }}
                />
              </div>

              <p
                className="text-white text-xl md:text-2xl font-bold mb-8"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Wir freuen uns von dir zu hören!
              </p>

              <div className="space-y-6 text-white/80" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {/* Address */}
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wide mb-2">Adresse</h3>
                  <p className="leading-relaxed">
                    Bloghead GmbH<br />
                    Musterstraße 1<br />
                    12345 Musterstadt<br />
                    Deutschland
                  </p>
                </div>

                {/* Email */}
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wide mb-2">E-Mail</h3>
                  <a
                    href="mailto:l3lim3d@gmail.com"
                    className="text-accent-purple hover:underline"
                  >
                    l3lim3d@gmail.com
                  </a>
                </div>

                {/* Phone */}
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wide mb-2">Telefon</h3>
                  <a
                    href="tel:+49123456789"
                    className="hover:text-white transition-colors"
                  >
                    +49 (0) 123 456789
                  </a>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wide mb-3">Social Media</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://instagram.com/bloghead"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-accent-purple hover:text-accent-purple transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="https://facebook.com/bloghead"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-accent-purple hover:text-accent-purple transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="lg:col-span-7">
              <div
                className="p-8 md:p-10 rounded-lg"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <h2
                  className="text-white text-xl font-bold uppercase tracking-wide mb-6"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Nachricht senden
                </h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
                    Vielen Dank für deine Nachricht! Wir melden uns so schnell wie möglich.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-white/70 text-sm mb-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#222] text-white border border-transparent focus:border-accent-purple focus:outline-none transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-white/70 text-sm mb-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#222] text-white border border-transparent focus:border-accent-purple focus:outline-none transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-white/70 text-sm mb-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Betreff *
                    </label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#222] text-white border border-transparent focus:border-accent-purple focus:outline-none transition-colors appearance-none cursor-pointer"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="general">Allgemeine Anfrage</option>
                      <option value="support">Technischer Support</option>
                      <option value="partnership">Partnerschaft</option>
                      <option value="press">Presse</option>
                      <option value="other">Sonstiges</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-white/70 text-sm mb-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Nachricht *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#222] text-white border border-transparent focus:border-accent-purple focus:outline-none transition-colors resize-none"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      checked={formData.privacy}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-white/30 bg-[#222] text-accent-purple focus:ring-accent-purple focus:ring-offset-0"
                    />
                    <label
                      htmlFor="privacy"
                      className="text-white/70 text-sm"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Ich akzeptiere die{' '}
                      <Link to="/datenschutz" className="text-accent-purple hover:underline">
                        Datenschutzerklärung
                      </Link>
                      {' '}*
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full text-white font-bold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 100%)',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  >
                    {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
    </div>
  )
}
