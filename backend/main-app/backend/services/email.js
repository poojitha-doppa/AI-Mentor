import axios from 'axios';

export async function sendOtpEmail({ toEmail, otp, serviceId, templateId, publicKey, privateKey }) {
  if (!serviceId || !templateId || !publicKey || !privateKey) {
    throw new Error('EmailJS serviceId, templateId, publicKey, and privateKey are required');
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      to_email: toEmail,
      otp_code: otp,
      to_name: toEmail.split('@')[0],
      from_name: 'Career Sync Team',
    },
  };

  console.log('📧 Sending OTP email to:', toEmail);
  
  const resp = await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  console.log('✅ OTP email sent successfully to:', toEmail);
  return resp.data;
}
