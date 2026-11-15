// functions/api/enquiry.js
// Cloudflare Pages Function: Secure Backend Email Dispatch for MyHookLab Enquiries

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. CORS & Preflight handling
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const data = await request.json();
    const {
      name,
      email,
      brand,
      businessType,
      attentionFocus,
      biggestChallenge,
      primaryGoal,
    } = data;

    // 2. Validate Required Fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: 'A valid email is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!businessType || !attentionFocus || !biggestChallenge || !primaryGoal) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please make a selection for all required questions',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanBrand = (brand || '').trim() || 'Not specified';
    const cleanBusinessType = String(businessType).trim();
    const cleanAttentionFocus = String(attentionFocus).trim();
    const cleanBiggestChallenge = String(biggestChallenge).trim();
    const cleanPrimaryGoal = String(primaryGoal).trim();
    const timestamp = new Date().toUTCString();

    const targetEmail = env.RECIPIENT_EMAIL || 'MyHookLab@proton.me';
    const emailSubject = `[MyHookLab Enquiry] ${cleanName} — ${cleanBusinessType}`;

    // 3. Option A: Deliver via Resend if RESEND_API_KEY is configured
    if (env.RESEND_API_KEY) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL || 'MyHookLab <onboarding@resend.dev>',
          to: [targetEmail],
          reply_to: cleanEmail,
          subject: emailSubject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background-color: #fafafa; border-radius: 12px; border: 1px solid #e4e4e7;">
              <div style="padding-bottom: 16px; border-bottom: 2px solid #ff4500; margin-bottom: 20px;">
                <h1 style="font-size: 20px; font-weight: 800; color: #ff4500; margin: 0;">MyHookLab Enquiry</h1>
                <p style="font-size: 13px; color: #71717a; margin: 4px 0 0 0;">New client attention challenge submitted at ${timestamp}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; width: 38%; color: #52525b;">Client Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 700; color: #09090b;">${cleanName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #52525b;">Email Address:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;"><a href="mailto:${cleanEmail}" style="color: #ff4500; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #52525b;">Business / Brand Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; color: #09090b;">${cleanBrand}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #52525b;">Business Type:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; color: #09090b; font-weight: 600;">${cleanBusinessType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #52525b;">Attention Focus / Service:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; color: #ff4500; font-weight: 600;">${cleanAttentionFocus}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #52525b;">Biggest Challenge:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; color: #09090b;">${cleanBiggestChallenge}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #52525b;">Primary Goal:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; color: #09090b; font-weight: 600;">${cleanPrimaryGoal}</td>
                </tr>
              </table>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e4e4e7; text-align: center;">
                <a href="mailto:${cleanEmail}?subject=Re:%20Your%20MyHookLab%20Enquiry" style="display: inline-block; padding: 10px 24px; background-color: #ff4500; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 9999px;">Reply to ${cleanName}</a>
              </div>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const errorText = await resendRes.text();
        console.error('Resend delivery failed:', errorText);
        // Fall back to Formsubmit bridge
      } else {
        return new Response(
          JSON.stringify({
            success: true,
            provider: 'resend',
            message: 'Enquiry delivered to MyHookLab@proton.me',
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // 4. Option B: Formsubmit Secure Bridge to MyHookLab@proton.me
    const origin = request.headers.get('origin') || 'https://myhooklab.pages.dev';
    const formsubmitRes = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: origin,
          Referer: `${origin}/`,
        },
        body: JSON.stringify({
          _subject: emailSubject,
          _replyto: cleanEmail,
          _template: 'table',
          _captcha: 'false',
          'Client Name': cleanName,
          'Client Email': cleanEmail,
          'Brand / Business Name': cleanBrand,
          'Business Type': cleanBusinessType,
          'Attention Focus (Service Required)': cleanAttentionFocus,
          'Biggest Challenge': cleanBiggestChallenge,
          'Primary Goal': cleanPrimaryGoal,
          'Submitted At': timestamp,
        }),
      }
    );

    const formsubmitData = await formsubmitRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        provider: 'formsubmit',
        activationNeeded: formsubmitData.message && formsubmitData.message.includes('Activation'),
        message: 'Enquiry submitted successfully and forwarded to MyHookLab@proton.me',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('API /api/enquiry error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An internal error occurred while processing your enquiry. Please try again.',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
