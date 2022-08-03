import SendGridMail from '@sendgrid/mail';
import logger from '../api/logger';
import {EMAIL_TEMPLATE_ID, SENDER_NAME, SENDGRID_API_KEY,} from '../config';

SendGridMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send email
 * @param from
 * @param to
 * @param templateId
 * @param data
 * @param lang, auto use the template for this language
 * @returns {Promise<never>}
 */
export async function sendEmail(from, to, templateId, data, lang = 'vi') {
  try {
    return SendGridMail.send({
      from: {
        name: SENDER_NAME,
        email: from,
      },
      to: to,
      templateId: EMAIL_TEMPLATE_ID[`${templateId}_${lang.toUpperCase()}}`],
      dynamic_template_data: data,
    });
  } catch (error) {
    logger.error('SendGrid sendEmail error:', error);
    logger.error('SendGrid sendEmail from, to, templateId, lang:', from, to, templateId, lang);
    logger.error('SendGrid sendEmail data:', data);
    throw error;
  }
}
