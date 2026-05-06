import { AppError } from '../utils/AppError.js';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export const logToSlack = async (error, req) => {
  if (!SLACK_WEBHOOK_URL) return;

  const isOperational = error.isOperational || error instanceof AppError;

  const message = {
    text: `🚨 *Error ${error.statusCode || 500} en BildyApp*`,
    attachments: [{
      color: isOperational ? 'warning' : 'danger',
      fields: [
        { title: 'Mensaje', value: error.message, short: false },
        { title: 'Ruta', value: `${req.method} ${req.originalUrl}`, short: true },
        { title: 'Timestamp', value: new Date().toISOString(), short: true },
        { title: 'IP', value: req.ip || req.connection.remoteAddress, short: true }
      ]
    }]
  };

  if (!isOperational && error.stack) {
    message.attachments[0].fields.push({
      title: 'Stack Trace',
      value: '```' + error.stack.substring(0, 500) + '```',
      short: false
    });
  }

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (err) {
    console.error('Error enviando a Slack:', err.message);
  }
};
