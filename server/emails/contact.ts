import { SOCIALS } from '../../src/home/data/socials.js'

export interface ContactEmailData {
  name: string
  email: string
  subject: string
  message: string
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

/** Plantilla HTML del correo que recibe el equipo cuando alguien completa el formulario de contacto. */
export function contactEmail({ name, email, subject, message }: ContactEmailData, assetOrigin: string) {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject)
  const safeMessage = message ? escapeHtml(message).replace(/\r?\n/g, '<br>') : '<i style="color:#9e97ac">No agregó un mensaje.</i>'
  const logoUrl = escapeHtml(new URL('/brand/logos/rs-email-logo.png', assetOrigin).href)
  const socialLinks = SOCIALS.map(
    ({ name, url }) => {
      const iconUrl = escapeHtml(new URL(`/brand/social/${name.toLowerCase()}.png`, assetOrigin).href)
      return `
      <td align="center" style="padding:0 5px;">
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(name)}" title="${escapeHtml(name)}" style="display:block;width:40px;height:40px;border:1px solid #29282f;border-radius:50%;background-color:#111114;color:#c8c8ce;text-align:center;text-decoration:none;">
          <img src="${iconUrl}" width="16" height="16" alt="" style="display:block;width:16px;height:16px;margin:12px auto 0;">
        </a>
      </td>`
    },
  ).join('')

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <title>Nuevo contacto · Radiant Shadows</title>
  </head>
  <body style="margin:0;padding:0;background-color:#000010;font-family:Arial,Helvetica,sans-serif;color:#eaeaea;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Nuevo mensaje de ${safeName} sobre ${safeSubject}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000010;">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;border:1px solid #7415C1;border-radius:16px;background-color:#0b0a18;overflow:hidden;">
            <tr>
              <td style="height:5px;background-color:#7415C1;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td align="center" bgcolor="#7415C1" style="padding:20px 32px 18px;background-color:#7415C1;">
                <nav aria-label="Radiant Shadows">
                  <img src="${logoUrl}" width="58" height="58" alt="Radiant Shadows" style="display:block;width:58px;height:58px;margin:0 auto;">
                </nav>
                <p style="margin:12px 0 0;color:#ffffff;font-size:12px;font-weight:bold;letter-spacing:3px;">RADIANT SHADOWS</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px;background-color:#0b0a18;">
                <div>
                  <span style="display:inline-block;padding:6px 10px;border:1px solid #59318a;border-radius:20px;color:#d9bdff;font-size:10px;font-weight:bold;letter-spacing:1.3px;">NUEVO CONTACTO</span>
                  <h1 style="margin:14px 0 0;color:#ffffff;font-size:26px;line-height:1.2;">Alguien quiere hablar con el equipo</h1>
                  <p style="margin:9px 0 0;color:#b8b2c5;font-size:14px;line-height:1.6;">Recibiste un mensaje desde el formulario de la web.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 26px;background-color:#0b0a18;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #392052;border-radius:12px;background-color:transparent;">
                  <tr>
                    <td style="padding:17px 18px 15px;">
                      <p style="margin:0 0 7px;color:#9e97ac;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;">Motivo</p>
                      <p style="margin:0;color:#eaeaea;font-size:16px;font-weight:bold;line-height:1.4;">${safeSubject}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                  <tr>
                    <td width="50%" valign="top" style="padding:0 8px 0 0;">
                      <p style="margin:0 0 6px;color:#9e97ac;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;">Nombre</p>
                      <p style="margin:0;color:#eaeaea;font-size:14px;line-height:1.5;">${safeName}</p>
                    </td>
                    <td width="50%" valign="top" style="padding:0 0 0 8px;">
                      <p style="margin:0 0 6px;color:#9e97ac;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;">Email</p>
                      <a href="mailto:${safeEmail}" style="color:#c79bff;font-size:14px;line-height:1.5;text-decoration:none;word-break:break-word;">${safeEmail}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 9px;color:#9e97ac;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;">Mensaje</p>
                <div style="padding:17px 18px;border-left:3px solid #7415C1;border-radius:0 10px 10px 0;background-color:transparent;color:#eaeaea;font-size:14px;line-height:1.75;overflow-wrap:anywhere;">${safeMessage}</div>
              </td>
            </tr>
            <tr>
              <td align="center" bgcolor="#000010" style="padding:20px 24px 24px;border-top:1px solid #282238;background-color:#000010;">
                <p style="margin:0 0 13px;color:#9e97ac;font-size:10px;font-weight:bold;letter-spacing:1.5px;">SEGUINOS</p>
                <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                  <tr>${socialLinks}</tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:#625c70;font-size:11px;line-height:1.5;">Notificación automática del formulario de contacto de Radiant Shadows.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
