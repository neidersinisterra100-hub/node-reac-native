export async function verifyTurnstile(
  token: string,
  ip?: string
): Promise<boolean> {
  if (!process.env.CLOUDFLARE_TURNSTILE_SECRET) {
    console.warn('[SECURITY] Turnstile secret no configurado');
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
          response: token,
          remoteip: ip
        })
      }
    );

    clearTimeout(timeout);

    const data = await res.json();

    return data.success === true;
  } catch (error) {
    console.warn('[SECURITY] Turnstile no respondió (timeout o red)');
    return false;
  }
}


// export async function verifyTurnstile(
//   token: string,
//   ip?: string
// ): Promise<boolean> {
//   const res = await fetch(
//     'https://challenges.cloudflare.com/turnstile/v0/siteverify',
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
//         response: token,
//         remoteip: ip
//       })
//     }
//   );

//   const data = await res.json();
//   return data.success === true;
// }
