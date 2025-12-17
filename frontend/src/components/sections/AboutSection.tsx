import { motion } from 'framer-motion'

export function AboutSection() {
  return (
    <section className="relative bg-bg-primary py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title */}
        <motion.div
          className="mb-12 md:mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white italic mb-4">
            Eine Plattform
          </h2>
          <p
            className="text-white/70 text-xl md:text-2xl font-bold"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Zwei Welten
          </p>
          {/* Gradient underline bar */}
          <motion.div
            className="h-1 w-32 md:w-40 mt-4 mx-auto"
            style={{
              background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 100%)'
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </motion.div>

        {/* Two Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Frontstage Card */}
          <motion.div
            className="rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, #F92B02 0%, #FB7A43 100%)',
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(249, 43, 2, 0.2)' }}
          >
            {/* Icon */}
            <div className="w-16 h-16 mb-6 text-white">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                <circle cx="32" cy="20" r="10" />
                <path d="M16 52c0-8.837 7.163-16 16-16s16 7.163 16 16" />
                <path d="M32 36v8M28 40h8" strokeWidth="3" />
              </svg>
            </div>

            <h3
              className="text-white text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Frontstage
            </h3>
            <p
              className="text-white/90 text-sm uppercase tracking-wider mb-4"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Artists &amp; ihre Community
            </p>
            <p
              className="text-white/80 text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Frontstage bringt Bloghead Artists und Community zusammen: Kuenstlerprofile treffen auf ihre Community, die Events, Tickets und Aktionen an einem Ort finden - fuer mehr Naehe, gemeinsamen Vibe und eine wachsende Crowd.
            </p>
          </motion.div>

          {/* Backstage Card */}
          <motion.div
            className="rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col"
            style={{
              backgroundColor: '#610AD1',
            }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(97, 10, 209, 0.3)' }}
          >
            {/* Icon */}
            <div className="w-16 h-16 mb-6 text-white">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                <rect x="8" y="12" width="48" height="36" rx="4" />
                <path d="M8 24h48" />
                <path d="M16 32h12M16 40h8" strokeLinecap="round" />
                <path d="M40 32h8M40 40h8" strokeLinecap="round" />
              </svg>
            </div>

            <h3
              className="text-white text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Backstage
            </h3>
            <p
              className="text-white/90 text-sm uppercase tracking-wider mb-4"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Organisation &amp; Verwaltung
            </p>
            <p
              className="text-white/80 text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Backstage bietet Bloghead alles fuer die Event-Orga: Angebote, Vertraege, Rechnungen und Frageboegen laufen mit Kontakten, E-Mails und Workflows in einem System zusammen - statt in verstreuten Postfaechern und Excel-Listen.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
