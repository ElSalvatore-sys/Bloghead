import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

interface VorteileMemberSectionProps {
  className?: string
  onMemberClick?: () => void
}

export function VorteileMemberSection({ className = '', onMemberClick }: VorteileMemberSectionProps) {
  return (
    <section className={`bg-bg-primary py-16 md:py-24 ${className}`}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Title - Roboto Bold, NOT Hyperwave */}
        <motion.h2
          className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide mb-8"
          style={{ fontFamily: 'Roboto, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          Vorteile Member
        </motion.h2>

        {/* Lorem Ipsum Paragraphs */}
        <motion.p
          className="text-white/60 text-sm md:text-base leading-relaxed mb-6"
          style={{ fontFamily: 'Roboto, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
          Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
          ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
        </motion.p>

        <motion.p
          className="text-white/60 text-sm md:text-base leading-relaxed mb-10"
          style={{ fontFamily: 'Roboto, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
          Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
          ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
        </motion.p>

        {/* CTA Button - Purple outline, centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={onMemberClick}
            className="border-accent-purple text-accent-purple hover:bg-accent-purple/10 px-10 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
          >
            Member Werden
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
