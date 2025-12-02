import { useState } from 'react'

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <h3
          className="text-white text-lg font-bold uppercase tracking-wide pr-4"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {title}
        </h3>
        <span className="text-accent-purple text-2xl flex-shrink-0">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[2000px] pb-6' : 'max-h-0'
        }`}
      >
        <div
          className="text-white/70 leading-relaxed space-y-4"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default function DatenschutzPage() {
  const [openSection, setOpenSection] = useState<number | null>(0)

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index)
  }

  return (
    <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="font-display text-5xl md:text-7xl text-white italic mb-4">
              Datenschutz
            </h1>
            <div
              className="h-1 w-32 md:w-40"
              style={{
                background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 100%)'
              }}
            />
          </div>

          <p
            className="text-white/60 text-sm mb-8"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Stand: Dezember 2024
          </p>

          {/* Accordion Sections */}
          <div className="divide-y divide-white/10">

            <AccordionItem
              title="1. Einleitung und Überblick"
              isOpen={openSection === 0}
              onToggle={() => toggleSection(0)}
            >
              <p>
                Wir haben diese Datenschutzerklärung (Fassung 01.12.2024) verfasst, um Ihnen gemäß der Vorgaben
                der Datenschutz-Grundverordnung (EU) 2016/679 und anwendbaren nationalen Gesetzen zu erklären,
                welche personenbezogenen Daten (kurz Daten) wir als Verantwortliche – und die von uns beauftragten
                Auftragsverarbeiter (z. B. Provider) – verarbeiten, zukünftig verarbeiten werden und welche
                rechtmäßigen Möglichkeiten Sie haben.
              </p>
              <p>
                Die verwendeten Begriffe sind geschlechtsneutral zu verstehen. Kurz gesagt: Wir informieren Sie
                umfassend über Daten, die wir über Sie verarbeiten.
              </p>
            </AccordionItem>

            <AccordionItem
              title="2. Verantwortlicher"
              isOpen={openSection === 1}
              onToggle={() => toggleSection(1)}
            >
              <p>Verantwortlicher für die Datenverarbeitung auf dieser Website:</p>
              <p>
                Bloghead GmbH<br />
                Musterstraße 1<br />
                12345 Musterstadt<br />
                Deutschland
              </p>
              <p>
                E-Mail: info@blog-head.com<br />
                Telefon: +49 (0) 123 456789
              </p>
            </AccordionItem>

            <AccordionItem
              title="3. Ihre Rechte laut DSGVO"
              isOpen={openSection === 2}
              onToggle={() => toggleSection(2)}
            >
              <p>Laut Artikel 13, 14 DSGVO informieren wir Sie über folgende Rechte:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie haben das Recht, eine Bestätigung zu verlangen, ob Sie betreffende Daten verarbeitet werden.</li>
                <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie haben das Recht auf Berichtigung unrichtiger Daten.</li>
                <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie haben das Recht auf Löschung Ihrer Daten („Recht auf Vergessenwerden").</li>
                <li><strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie haben das Recht, die Einschränkung der Verarbeitung zu verlangen.</li>
                <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, Daten in einem maschinenlesbaren Format zu erhalten.</li>
                <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das Recht, der Verarbeitung zu widersprechen.</li>
                <li><strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.</li>
              </ul>
            </AccordionItem>

            <AccordionItem
              title="4. Datenübertragung in Drittländer"
              isOpen={openSection === 3}
              onToggle={() => toggleSection(3)}
            >
              <p>
                Wir übertragen oder verarbeiten Daten nur dann in Länder außerhalb der EU (Drittländer), wenn Sie
                dieser Verarbeitung zustimmen, dies gesetzlich vorgeschrieben ist oder vertraglich notwendig und
                in jedem Fall nur soweit dies generell erlaubt ist. Ihre Zustimmung ist in den meisten Fällen der
                wichtigste Grund, dass wir Daten in Drittländern verarbeiten lassen.
              </p>
              <p>
                Die Verarbeitung personenbezogener Daten in Drittländern wie den USA, wo viele Softwarehersteller
                Dienstleistungen anbieten und Ihre Serverstandorte haben, kann bedeuten, dass personenbezogene Daten
                auf unerwartete Weise verarbeitet und gespeichert werden.
              </p>
            </AccordionItem>

            <AccordionItem
              title="5. Cookies"
              isOpen={openSection === 4}
              onToggle={() => toggleSection(4)}
            >
              <p>
                Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät
                speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
              </p>
              <p>Wir verwenden folgende Arten von Cookies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Notwendige Cookies:</strong> Diese Cookies sind für den Betrieb der Website unbedingt erforderlich.</li>
                <li><strong>Funktionale Cookies:</strong> Diese Cookies ermöglichen erweiterte Funktionalitäten.</li>
                <li><strong>Analyse-Cookies:</strong> Diese Cookies helfen uns, das Nutzerverhalten zu verstehen.</li>
                <li><strong>Marketing-Cookies:</strong> Diese Cookies werden für Werbezwecke verwendet.</li>
              </ul>
              <p>
                Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und
                einzeln über deren Annahme entscheiden oder die Annahme von Cookies generell ausschließen.
              </p>
            </AccordionItem>

            <AccordionItem
              title="6. Web Analytics"
              isOpen={openSection === 5}
              onToggle={() => toggleSection(5)}
            >
              <p>
                Wir verwenden auf unserer Website möglicherweise Analysedienste, um das Nutzerverhalten zu
                analysieren und unser Angebot zu verbessern. Die gesammelten Daten werden anonymisiert verarbeitet.
              </p>
              <p>
                Wenn wir Google Analytics einsetzen, werden Ihre Daten an Google-Server in den USA übertragen.
                Wir haben mit Google einen Auftragsverarbeitungsvertrag abgeschlossen. Google ist unter dem
                EU-US Data Privacy Framework zertifiziert.
              </p>
            </AccordionItem>

            <AccordionItem
              title="7. Newsletter"
              isOpen={openSection === 6}
              onToggle={() => toggleSection(6)}
            >
              <p>
                Wenn Sie sich für unseren Newsletter anmelden, werden die oben genannten Daten nur für diesen Zweck
                verwendet. Abonnenten können auch über Umstände per E-Mail informiert werden, die für den Dienst
                oder die Registrierung relevant sind.
              </p>
              <p>
                Für eine wirksame Registrierung benötigen wir eine gültige E-Mail-Adresse. Um zu überprüfen, dass
                eine Anmeldung tatsächlich durch den Inhaber einer E-Mail-Adresse erfolgt, setzen wir das
                „Double-opt-in"-Verfahren ein.
              </p>
              <p>
                Die Abmeldung vom Newsletter ist jederzeit über einen Link in jeder Newsletter-E-Mail oder durch
                eine Nachricht an uns möglich.
              </p>
            </AccordionItem>

            <AccordionItem
              title="8. Kontaktformular"
              isOpen={openSection === 7}
              onToggle={() => toggleSection(7)}
            >
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
                Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der
                Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
              </p>
              <p>
                Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung erfolgt auf Grundlage
                von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt
                oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.
              </p>
            </AccordionItem>

            <AccordionItem
              title="9. Social Media"
              isOpen={openSection === 8}
              onToggle={() => toggleSection(8)}
            >
              <p>
                Auf unserer Website sind Social-Media-Plugins verschiedener Anbieter integriert. Wenn Sie eine
                Seite besuchen, die ein solches Plugin enthält, wird eine direkte Verbindung zwischen Ihrem
                Browser und dem Server des Social-Media-Anbieters hergestellt.
              </p>
              <p>
                Wir haben keinen Einfluss auf den Umfang der Daten, die der Anbieter mit Hilfe des Plugins erhebt.
                Bitte informieren Sie sich in den Datenschutzerklärungen der jeweiligen Anbieter.
              </p>
            </AccordionItem>

            <AccordionItem
              title="10. Zahlungsanbieter"
              isOpen={openSection === 9}
              onToggle={() => toggleSection(9)}
            >
              <p>
                Für die Abwicklung von Zahlungen nutzen wir externe Zahlungsdienstleister. Dabei werden
                zahlungsrelevante Daten (z.B. Bankverbindung, Kreditkartennummer) an den jeweiligen
                Zahlungsdienstleister übermittelt.
              </p>
              <p>
                Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und effizienten
                Zahlungsabwicklung).
              </p>
            </AccordionItem>

            <AccordionItem
              title="11. Änderungen der Datenschutzerklärung"
              isOpen={openSection === 10}
              onToggle={() => toggleSection(10)}
            >
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
                rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
                Datenschutzerklärung umzusetzen.
              </p>
              <p>
                Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung. Wir empfehlen Ihnen, diese
                Datenschutzerklärung regelmäßig zu lesen, um über den Schutz der von uns erfassten persönlichen
                Daten auf dem Laufenden zu bleiben.
              </p>
            </AccordionItem>

          </div>
        </div>
    </div>
  )
}
