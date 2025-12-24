/**
 * German Email Templates for Bloghead Notifications
 *
 * These templates are used by Supabase Edge Functions to send transactional emails.
 * All templates are in German and follow Bloghead's design system.
 */

export interface EmailTemplateData {
  userName?: string
  artistName?: string
  eventDate?: string
  eventTime?: string
  eventLocation?: string
  amount?: number
  bookingId?: string
  reviewText?: string
  rating?: number
  actionUrl?: string
}

// Base HTML wrapper for all emails
function getEmailWrapper(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bloghead</title>
  <meta name="x-apple-disable-message-reformatting">
  <!--[if mso]>
  <style>
    table { border-collapse: collapse; }
    .content-wrapper { width: 600px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #171717; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
  </div>

  <!-- Email Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #171717;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="content-wrapper" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #232323; border-radius: 16px; overflow: hidden;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background: linear-gradient(135deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%);">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #FFFFFF; letter-spacing: -0.5px;">
                BLOGHEAD
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.5);">
                © ${new Date().getFullYear()} Bloghead. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                <a href="https://blog-head.com/impressum" style="color: #610AD1; text-decoration: none;">Impressum</a>
                &nbsp;·&nbsp;
                <a href="https://blog-head.com/datenschutz" style="color: #610AD1; text-decoration: none;">Datenschutz</a>
                &nbsp;·&nbsp;
                <a href="https://blog-head.com/dashboard/settings/notifications" style="color: #610AD1; text-decoration: none;">Benachrichtigungen verwalten</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// Button component
function getButton(text: string, url: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 24px 0;">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #610AD1 0%, #F92B02 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `
}

// ============================================================================
// BOOKING TEMPLATES
// ============================================================================

export function bookingRequestEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Neue Buchungsanfrage! 🎉
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.artistName || 'Künstler'},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Du hast eine neue Buchungsanfrage von <strong style="color: #FFFFFF;">${data.userName}</strong> erhalten.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Datum</span><br>
                <span style="color: #FFFFFF; font-size: 16px; font-weight: 500;">${data.eventDate || 'TBD'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Uhrzeit</span><br>
                <span style="color: #FFFFFF; font-size: 16px; font-weight: 500;">${data.eventTime || 'TBD'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Ort</span><br>
                <span style="color: #FFFFFF; font-size: 16px; font-weight: 500;">${data.eventLocation || 'TBD'}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.5);">
      Bitte antworte innerhalb von 48 Stunden.
    </p>

    ${getButton('Buchung ansehen', data.actionUrl || 'https://blog-head.com/dashboard/bookings')}
  `

  return {
    subject: `Neue Buchungsanfrage von ${data.userName}`,
    html: getEmailWrapper(content, `${data.userName} möchte dich buchen!`),
  }
}

export function bookingConfirmedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Buchung bestätigt! ✅
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.userName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Tolle Neuigkeiten! <strong style="color: #FFFFFF;">${data.artistName}</strong> hat deine Buchung bestätigt.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Künstler</span><br>
                <span style="color: #FFFFFF; font-size: 16px; font-weight: 500;">${data.artistName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Datum</span><br>
                <span style="color: #FFFFFF; font-size: 16px; font-weight: 500;">${data.eventDate || 'TBD'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Ort</span><br>
                <span style="color: #FFFFFF; font-size: 16px; font-weight: 500;">${data.eventLocation || 'TBD'}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${getButton('Buchungsdetails', data.actionUrl || 'https://blog-head.com/dashboard/bookings')}
  `

  return {
    subject: `Buchung bestätigt: ${data.artistName} am ${data.eventDate}`,
    html: getEmailWrapper(content, `Deine Buchung mit ${data.artistName} wurde bestätigt!`),
  }
}

export function bookingDeclinedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Buchung abgelehnt
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.userName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Leider konnte <strong style="color: #FFFFFF;">${data.artistName}</strong> deine Buchungsanfrage nicht annehmen.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Lass dich nicht entmutigen! Entdecke andere talentierte Künstler auf Bloghead.
    </p>

    ${getButton('Andere Künstler entdecken', 'https://blog-head.com/artists')}
  `

  return {
    subject: `Buchungsanfrage wurde abgelehnt`,
    html: getEmailWrapper(content, `${data.artistName} konnte deine Anfrage leider nicht annehmen.`),
  }
}

export function bookingCancelledEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Buchung storniert
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.userName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Deine Buchung mit <strong style="color: #FFFFFF;">${data.artistName}</strong> am ${data.eventDate} wurde storniert.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6;">
      Falls eine Erstattung fällig ist, wird diese innerhalb von 5-10 Werktagen bearbeitet.
    </p>

    ${getButton('Zur Dashboard', 'https://blog-head.com/dashboard')}
  `

  return {
    subject: `Buchung storniert: ${data.artistName}`,
    html: getEmailWrapper(content, `Deine Buchung wurde storniert.`),
  }
}

// ============================================================================
// REMINDER TEMPLATES
// ============================================================================

export function reminder24hEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Morgen ist es soweit! ⏰
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.userName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Zur Erinnerung: Dein Event mit <strong style="color: #FFFFFF;">${data.artistName}</strong> findet morgen statt!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(251, 122, 67, 0.1); border: 1px solid rgba(251, 122, 67, 0.3); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.5);">In weniger als</p>
          <p style="margin: 0; font-size: 36px; font-weight: bold; color: #FB7A43;">24 Stunden</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 14px;">📅 ${data.eventDate}</p>
          <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.5); font-size: 14px;">🕐 ${data.eventTime}</p>
          <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 14px;">📍 ${data.eventLocation}</p>
        </td>
      </tr>
    </table>

    ${getButton('Buchungsdetails', data.actionUrl || 'https://blog-head.com/dashboard/bookings')}
  `

  return {
    subject: `Reminder: Morgen ist dein Event mit ${data.artistName}!`,
    html: getEmailWrapper(content, `Morgen: Event mit ${data.artistName}`),
  }
}

export function reminder1hEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Los geht's in 1 Stunde! 🎤
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.userName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Dein Event mit <strong style="color: #FFFFFF;">${data.artistName}</strong> startet in einer Stunde!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(97, 10, 209, 0.1); border: 1px solid rgba(97, 10, 209, 0.3); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 48px; font-weight: bold; color: #610AD1;">🎉</p>
          <p style="margin: 8px 0 0 0; font-size: 18px; color: #FFFFFF;">Viel Spaß!</p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.5);">
      📍 ${data.eventLocation}
    </p>
  `

  return {
    subject: `In 1 Stunde: Event mit ${data.artistName}`,
    html: getEmailWrapper(content, `Dein Event startet in 1 Stunde!`),
  }
}

// ============================================================================
// PAYMENT TEMPLATES
// ============================================================================

export function paymentReceivedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const formattedAmount = data.amount
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(data.amount)
    : '€0,00'

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Zahlung erhalten! 💰
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.artistName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Du hast eine Zahlung für deine Buchung erhalten.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.5);">Betrag</p>
          <p style="margin: 0; font-size: 36px; font-weight: bold; color: #10B981;">${formattedAmount}</p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6;">
      Die Auszahlung erfolgt automatisch nach Abschluss der Buchung.
    </p>

    ${getButton('Zahlungsverlauf', 'https://blog-head.com/dashboard/payments')}
  `

  return {
    subject: `Zahlung erhalten: ${formattedAmount}`,
    html: getEmailWrapper(content, `Du hast ${formattedAmount} erhalten!`),
  }
}

export function payoutSentEmail(data: EmailTemplateData): { subject: string; html: string } {
  const formattedAmount = data.amount
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(data.amount)
    : '€0,00'

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Auszahlung unterwegs! 🏦
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.artistName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Deine Auszahlung ist auf dem Weg zu deinem Bankkonto!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.5);">Auszahlungsbetrag</p>
          <p style="margin: 0; font-size: 36px; font-weight: bold; color: #10B981;">${formattedAmount}</p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6;">
      Die Überweisung dauert in der Regel 2-3 Werktage.
    </p>

    ${getButton('Zahlungsverlauf', 'https://blog-head.com/dashboard/payments')}
  `

  return {
    subject: `Auszahlung: ${formattedAmount} unterwegs`,
    html: getEmailWrapper(content, `Deine Auszahlung von ${formattedAmount} wurde veranlasst.`),
  }
}

// ============================================================================
// SOCIAL TEMPLATES
// ============================================================================

export function newFollowerEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Neuer Follower! 👋
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.artistName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      <strong style="color: #FFFFFF;">${data.userName}</strong> folgt dir jetzt auf Bloghead!
    </p>

    ${getButton('Profil ansehen', data.actionUrl || 'https://blog-head.com/dashboard')}
  `

  return {
    subject: `${data.userName} folgt dir jetzt!`,
    html: getEmailWrapper(content, `Neuer Follower: ${data.userName}`),
  }
}

export function newReviewEmail(data: EmailTemplateData): { subject: string; html: string } {
  const stars = data.rating ? '⭐'.repeat(data.rating) : '⭐⭐⭐⭐⭐'

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Neue Bewertung! ⭐
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.artistName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      <strong style="color: #FFFFFF;">${data.userName}</strong> hat eine Bewertung für dich hinterlassen.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 12px 0; font-size: 24px;">${stars}</p>
          ${data.reviewText ? `<p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.7); font-style: italic;">"${data.reviewText}"</p>` : ''}
        </td>
      </tr>
    </table>

    ${getButton('Zur Bewertung', data.actionUrl || 'https://blog-head.com/dashboard/reviews')}
  `

  return {
    subject: `Neue ${data.rating}-Sterne Bewertung von ${data.userName}`,
    html: getEmailWrapper(content, `${data.userName} hat dich bewertet!`),
  }
}

// ============================================================================
// MESSAGE TEMPLATE
// ============================================================================

export function newMessageEmail(data: EmailTemplateData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #FFFFFF;">
      Neue Nachricht! 💬
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Hallo ${data.userName || data.artistName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
      Du hast eine neue Nachricht erhalten.
    </p>

    ${getButton('Nachricht lesen', data.actionUrl || 'https://blog-head.com/dashboard/messages')}
  `

  return {
    subject: `Neue Nachricht auf Bloghead`,
    html: getEmailWrapper(content, `Du hast eine neue Nachricht!`),
  }
}

// ============================================================================
// EXPORT ALL TEMPLATES
// ============================================================================

export const emailTemplates = {
  booking_request: bookingRequestEmail,
  booking_confirmed: bookingConfirmedEmail,
  booking_declined: bookingDeclinedEmail,
  booking_cancelled: bookingCancelledEmail,
  reminder_24h: reminder24hEmail,
  reminder_1h: reminder1hEmail,
  payment_received: paymentReceivedEmail,
  payout_sent: payoutSentEmail,
  new_follower: newFollowerEmail,
  new_review: newReviewEmail,
  new_message: newMessageEmail,
}

export type EmailTemplateName = keyof typeof emailTemplates
