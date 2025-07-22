export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await fetch('https://shifa-email-backend.onrender.com/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: subject,
        html: `<p>${message}</p>`,
      }),
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Email failed');
      } else {
        const errorText = await response.text();
        throw new Error('Unexpected HTML response:\n' + errorText);
      }
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      throw new Error('Expected JSON, but got something else');
    }
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};
