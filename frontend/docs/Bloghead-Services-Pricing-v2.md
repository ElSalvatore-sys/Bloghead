# Bloghead - Services & Pricing Guide v2

## Uebersicht der Hosting-Optionen

Diese Dokumentation beschreibt die empfohlenen Hosting-Services fuer Bloghead mit aktuellen Preisen (Stand: Dezember 2025).

---

## Empfohlene Konfiguration

### Option A: Budget-Freundlich (IONOS)

| Service | Anbieter | Monatliche Kosten | Jaehrliche Kosten |
|---------|----------|-------------------|-------------------|
| Webhosting | IONOS Essential | 4,00 EUR | 48,00 EUR |
| Supabase | Free Tier | 0,00 EUR | 0,00 EUR |
| Twilio SMS | Pay-as-you-go | ~5-10 EUR | ~60-120 EUR |
| **Gesamt** | | **~9-14 EUR/Monat** | **~108-168 EUR/Jahr** |

### Option B: Professional (IONOS + Supabase Pro)

| Service | Anbieter | Monatliche Kosten | Jaehrliche Kosten |
|---------|----------|-------------------|-------------------|
| Webhosting | IONOS Business | 8,00 EUR | 96,00 EUR |
| Supabase | Pro Plan | 25,00 USD (~23 EUR) | 300 USD (~276 EUR) |
| Twilio SMS | Pay-as-you-go | ~20-50 EUR | ~240-600 EUR |
| **Gesamt** | | **~51-81 EUR/Monat** | **~612-972 EUR/Jahr** |

---

## Service-Details

### 1. IONOS Webhosting

#### IONOS Essential (Empfohlen fuer Start)
- **Preis**: 4,00 EUR/Monat (1. Jahr oft guenstiger)
- **Inkludiert**:
  - 50 GB SSD Speicher
  - Unbegrenzter Traffic
  - 1 Domain inklusive (.de oder .com)
  - SSL-Zertifikat (kostenlos)
  - PHP 8.x Support
  - MySQL Datenbank
  - E-Mail Postfaecher
  - 24/7 Support

#### IONOS Business (Fuer Wachstum)
- **Preis**: 8,00 EUR/Monat
- **Zusaetzlich**:
  - 100 GB SSD Speicher
  - Bessere Performance
  - Staging-Umgebung
  - Automatische Backups

**Hinweis**: Domain ist bereits im IONOS-Paket enthalten!

---

### 2. Supabase (Backend-as-a-Service)

#### Free Tier (Zum Starten)
- **Preis**: 0,00 EUR/Monat
- **Limits**:
  - 500 MB Datenbank
  - 1 GB Storage
  - 2 GB Bandwidth
  - 50.000 monatliche aktive User
  - Community Support
  - 2 Projekte max

#### Pro Plan (Fuer Produktion)
- **Preis**: 25 USD/Monat (~23 EUR)
- **Inkludiert**:
  - 8 GB Datenbank
  - 100 GB Storage
  - 250 GB Bandwidth
  - Keine User-Limits
  - E-Mail Support
  - Taegliche Backups
  - Point-in-Time Recovery (7 Tage)

#### Team Plan (Enterprise)
- **Preis**: 599 USD/Monat
- Fuer grosse Teams und hohe Anforderungen

**Empfehlung**: Mit Free Tier starten, bei >500 MB Daten oder Produktion auf Pro upgraden.

---

### 3. Twilio (SMS-Verifizierung)

#### Pricing-Modell: Pay-as-you-go

| SMS-Typ | Preis pro SMS |
|---------|---------------|
| Ausgehend (DE) | ~0,07 EUR |
| Eingehend (DE) | ~0,0075 EUR |
| Verifizierung | ~0,05-0,10 EUR |

#### Geschaetzte Kosten

| Szenario | SMS/Monat | Kosten/Monat |
|----------|-----------|--------------|
| Startup (100 User) | ~200 | ~14 EUR |
| Wachstum (500 User) | ~1.000 | ~70 EUR |
| Scale (2.000 User) | ~4.000 | ~280 EUR |

#### Twilio Verify (Empfohlen)
- **Preis**: 0,05 USD pro erfolgreicher Verifizierung
- Inkludiert: SMS + E-Mail + Push + TOTP
- Betrugspraevention inklusive

**Alternative**: Supabase Auth hat eingebaute E-Mail-Verifizierung (kostenlos).

---

## Kostenszenarien

### Szenario 1: MVP/Beta Launch

**Ziel**: Plattform mit ersten 100-500 Nutzern testen

| Service | Wahl | Kosten/Monat |
|---------|------|--------------|
| Hosting | IONOS Essential | 4 EUR |
| Backend | Supabase Free | 0 EUR |
| SMS | Twilio (minimal) | 10 EUR |
| Domain | Inkludiert | 0 EUR |
| **Total** | | **~14 EUR** |

**Jaehrlich**: ~168 EUR

---

### Szenario 2: Produktiv-Launch

**Ziel**: Plattform fuer 500-2.000 Nutzer

| Service | Wahl | Kosten/Monat |
|---------|------|--------------|
| Hosting | IONOS Business | 8 EUR |
| Backend | Supabase Pro | 23 EUR |
| SMS | Twilio (moderate) | 50 EUR |
| Domain | Inkludiert | 0 EUR |
| **Total** | | **~81 EUR** |

**Jaehrlich**: ~972 EUR

---

### Szenario 3: Skalierung

**Ziel**: Plattform fuer 5.000+ Nutzer

| Service | Wahl | Kosten/Monat |
|---------|------|--------------|
| Hosting | IONOS Business oder Vercel Pro | 20 EUR |
| Backend | Supabase Pro (erhoehte Limits) | 50+ EUR |
| SMS | Twilio (hoch) | 200 EUR |
| CDN | Cloudflare Pro (optional) | 20 EUR |
| Monitoring | Sentry/LogRocket | 30 EUR |
| **Total** | | **~320 EUR** |

**Jaehrlich**: ~3.840 EUR

---

## Weitere Services (Optional)

### E-Mail-Versand

#### Option 1: IONOS Mail (Inkludiert)
- Im Hosting-Paket enthalten
- Fuer transaktionale E-Mails begrenzt geeignet

#### Option 2: SendGrid/Resend
- **Free Tier**: 100 E-Mails/Tag
- **Paid**: Ab 15 USD/Monat fuer 50.000 E-Mails

### Monitoring & Analytics

| Service | Preis | Verwendung |
|---------|-------|------------|
| Vercel Analytics | Inkludiert | Performance |
| Sentry | Free bis 5k Events | Error Tracking |
| Plausible | 9 EUR/Monat | Privacy-freundliches Analytics |
| Google Analytics | Kostenlos | Standard Analytics |

### CDN (Content Delivery Network)

| Anbieter | Preis | Features |
|----------|-------|----------|
| Cloudflare | Free | Basis CDN, DDoS-Schutz |
| Cloudflare Pro | 20 EUR/Monat | Image Optimization, WAF |
| Bunny CDN | ~1-5 EUR/Monat | Pay-per-Use |

---

## Zahlungsintegration (Zukunft)

### Stripe (Empfohlen)
- **Transaktionsgebuehr**: 1,4% + 0,25 EUR (EU-Karten)
- **Keine monatlichen Kosten**
- Escrow-System moeglich mit Stripe Connect

### PayPal
- **Transaktionsgebuehr**: 2,49% + 0,35 EUR
- Hoehere Gebuehren, aber bekannter

### SEPA-Lastschrift
- Via Stripe: 0,35 EUR pro Transaktion
- Ideal fuer Abonnements

---

## Empfohlene Launch-Strategie

### Phase 1: Beta (Monat 1-3)
```
IONOS Essential     4 EUR
Supabase Free       0 EUR
Twilio minimal     10 EUR
------------------------
Total:            ~14 EUR/Monat
```

### Phase 2: Soft Launch (Monat 4-6)
```
IONOS Business      8 EUR
Supabase Free       0 EUR (noch ausreichend)
Twilio moderate    30 EUR
------------------------
Total:            ~38 EUR/Monat
```

### Phase 3: Produktion (Monat 7+)
```
IONOS Business      8 EUR
Supabase Pro       23 EUR
Twilio scale       70 EUR
------------------------
Total:           ~101 EUR/Monat
```

---

## Kostenvergleich mit Alternativen

### Bloghead (Custom Development) vs. fertige Loesungen

| Aspekt | Bloghead | Fertige Booking-SaaS |
|--------|----------|---------------------|
| Setup-Kosten | 0 EUR (schon gebaut) | 0-500 EUR |
| Monatliche Kosten | 14-100 EUR | 50-500 EUR |
| Anpassbarkeit | 100% | Begrenzt |
| Eigentuemer der Daten | Ja | Meist nicht |
| Skalierbarkeit | Unbegrenzt | Abhaengig von Plan |

---

## Zusammenfassung

### Minimale Kosten (Start):
- **~14 EUR/Monat** mit IONOS + Supabase Free + minimales Twilio

### Realistische Kosten (Produktion):
- **~80-100 EUR/Monat** mit allen notwendigen Services

### Vorteile gegenueber Domain-Kauf:
- Domain ist bei IONOS **inklusive** (erspart ~12-15 EUR/Jahr)
- SSL-Zertifikat ist **inklusive** (erspart ~50-100 EUR/Jahr)

### Wichtige Hinweise:
1. Preise koennen sich aendern - immer aktuelle Preise pruefen
2. IONOS bietet oft Rabatte fuer das erste Jahr
3. Supabase Free Tier ist grosszuegig - reicht fuer MVP
4. Twilio-Kosten skalieren mit Nutzerzahl

---

*Pricing Guide v2 - Bloghead*
*Stand: Dezember 2024*
*Alle Preise ohne Gewaehr*
