const COOKIE_NAME = '__Host-mikes-pub-preview';
const LOGIN_PATH = '/__preview';
const LOGOUT_PATH = '/__preview/logout';
const SESSION_PURPOSE = 'mikes-pub-private-preview-v1';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MINIMUM_PASSWORD_LENGTH = 12;

interface PreviewEnvironment {
  PREVIEW_PASSWORD?: string;
}

interface PreviewContext {
  request: Request;
  env: PreviewEnvironment;
  next(): Promise<Response>;
}

const encoder = new TextEncoder();

function safeReturnPath(value: string | null): string {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/';
  }

  const parsed = new URL(value, 'https://preview.invalid');
  if (parsed.origin !== 'https://preview.invalid' || parsed.pathname.startsWith(LOGIN_PATH)) {
    return '/';
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  );
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function encodeBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');
}

function decodeBase64Url(value: string): ArrayBuffer | null {
  try {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0)).buffer;
  } catch {
    return null;
  }
}

async function sessionToken(secret: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    'HMAC',
    await importHmacKey(secret),
    encoder.encode(SESSION_PURPOSE),
  );
  return encodeBase64Url(new Uint8Array(signature));
}

async function passwordMatches(candidate: string, secret: string): Promise<boolean> {
  const candidateSignature = decodeBase64Url(await sessionToken(candidate));
  if (!candidateSignature) return false;

  return crypto.subtle.verify(
    'HMAC',
    await importHmacKey(secret),
    candidateSignature,
    encoder.encode(SESSION_PURPOSE),
  );
}

function cookieValue(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  for (const entry of cookieHeader.split(';')) {
    const [name, ...valueParts] = entry.trim().split('=');
    if (name === COOKIE_NAME) return valueParts.join('=');
  }

  return null;
}

async function hasValidSession(request: Request, secret: string): Promise<boolean> {
  const token = cookieValue(request);
  if (!token) return false;

  const signature = decodeBase64Url(token);
  if (!signature) return false;

  return crypto.subtle.verify(
    'HMAC',
    await importHmacKey(secret),
    signature,
    encoder.encode(SESSION_PURPOSE),
  );
}

function securityHeaders(headers = new Headers()): Headers {
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=(), payment=(), usb=()');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return headers;
}

function redirect(location: URL | string, status = 303, cookie?: string): Response {
  const headers = securityHeaders(new Headers({ Location: location.toString() }));
  if (cookie) headers.set('Set-Cookie', cookie);
  return new Response(null, { status, headers });
}

function loginPage(returnPath: string, wrongPassword = false, headOnly = false): Response {
  const action = `${LOGIN_PATH}?returnTo=${encodeURIComponent(returnPath)}`;
  const error = wrongPassword
    ? '<p class="error" id="password-error" role="alert">Passordet var ikke riktig. Prøv igjen.</p>'
    : '';
  const describedBy = wrongPassword ? ' aria-describedby="password-error"' : '';
  const body = `<!doctype html>
<html lang="no">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <title>Privat forhåndsvisning | Mike's Pub</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; color: #f8f3e6; background: #0b100d; }
      body::before { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: .18; background: radial-gradient(circle at 18% 12%, #277249 0, transparent 34%), linear-gradient(125deg, transparent 48%, #d29b3f18 48%, #d29b3f18 49%, transparent 49%); }
      main { position: relative; display: grid; min-height: 100vh; align-items: center; padding: clamp(1.25rem, 4vw, 4rem); }
      .door { width: min(100%, 34rem); margin-inline: auto; border: 1px solid #e4b65f55; border-radius: .35rem; padding: clamp(1.5rem, 6vw, 3.5rem); background: #111a14f2; box-shadow: 0 2rem 6rem #000a, inset 0 0 0 .4rem #0b100d; }
      .eyebrow { margin: 0 0 1rem; color: #e7b75e; font-size: .75rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
      h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(2.5rem, 10vw, 4.75rem); font-weight: 700; line-height: .94; letter-spacing: -.055em; }
      .lead { max-width: 31rem; margin: 1.25rem 0 2rem; color: #cad1c9; font-size: 1.05rem; line-height: 1.6; }
      label { display: block; margin-bottom: .55rem; font-size: .9rem; font-weight: 750; }
      input { width: 100%; min-height: 3.25rem; border: 1px solid #667068; border-radius: .2rem; padding: .75rem .9rem; color: #fff; background: #090d0a; font: inherit; }
      input:focus { outline: .18rem solid #e7b75e; outline-offset: .18rem; border-color: #e7b75e; }
      button { width: 100%; min-height: 3.25rem; margin-top: .8rem; border: 1px solid #e7b75e; border-radius: .2rem; padding: .75rem 1rem; color: #10160f; background: #e7b75e; font: inherit; font-weight: 850; cursor: pointer; }
      button:hover { background: #f4c870; }
      button:focus-visible { outline: .18rem solid #fff; outline-offset: .18rem; }
      .error { margin: .75rem 0 0; color: #ffb2a8; font-weight: 700; }
      .note { margin: 1.5rem 0 0; padding-top: 1.25rem; border-top: 1px solid #ffffff1c; color: #929c93; font-size: .8rem; line-height: 1.5; }
      @media (prefers-reduced-motion: no-preference) { .door { animation: arrive .45s ease-out both; } @keyframes arrive { from { opacity: 0; transform: translateY(.6rem); } } }
      @media (forced-colors: active) { .door, input, button { border: 2px solid CanvasText; } }
    </style>
  </head>
  <body>
    <main>
      <section class="door" aria-labelledby="preview-title">
        <p class="eyebrow">Privat forhåndsvisning</p>
        <h1 id="preview-title">Mike's Pub</h1>
        <p class="lead">Skriv inn passordet du har fått for å se designforslaget.</p>
        <form method="post" action="${escapeHtml(action)}">
          <label for="password">Passord</label>
          <input id="password" name="password" type="password" required autocomplete="current-password" autofocus${describedBy}>
          ${error}
          <button type="submit">Åpne designforslaget</button>
        </form>
        <p class="note">Privat designforslag · Ikke den offisielle nettsiden</p>
      </section>
    </main>
  </body>
</html>`;

  const headers = securityHeaders(new Headers({ 'Content-Type': 'text/html; charset=utf-8' }));
  headers.set(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  );
  return new Response(headOnly ? null : body, { status: wrongPassword ? 401 : 200, headers });
}

function unavailable(): Response {
  const headers = securityHeaders(new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }));
  return new Response('Forhåndsvisningen er ikke konfigurert ennå.', { status: 503, headers });
}

function withSecurityHeaders(response: Response): Response {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: securityHeaders(new Headers(response.headers)),
  });
}

export async function onRequest(context: PreviewContext): Promise<Response> {
  const secret = context.env.PREVIEW_PASSWORD;
  if (!secret || secret.length < MINIMUM_PASSWORD_LENGTH) return unavailable();

  const url = new URL(context.request.url);
  const returnPath = safeReturnPath(url.searchParams.get('returnTo'));
  const signedIn = await hasValidSession(context.request, secret);

  if (url.pathname === LOGIN_PATH || url.pathname === `${LOGIN_PATH}/`) {
    if (context.request.method === 'GET' || context.request.method === 'HEAD') {
      if (signedIn) return redirect(new URL(returnPath, url), 303);
      return loginPage(returnPath, false, context.request.method === 'HEAD');
    }

    if (context.request.method !== 'POST') {
      const response = new Response('Method Not Allowed', { status: 405 });
      response.headers.set('Allow', 'GET, HEAD, POST');
      return withSecurityHeaders(response);
    }

    let candidate = '';
    try {
      const value = (await context.request.formData()).get('password');
      if (typeof value === 'string') candidate = value;
    } catch {
      return loginPage(returnPath, true);
    }

    if (!(await passwordMatches(candidate, secret))) return loginPage(returnPath, true);

    const cookie = `${COOKIE_NAME}=${await sessionToken(secret)}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
    return redirect(new URL(returnPath, url), 303, cookie);
  }

  if (url.pathname === LOGOUT_PATH) {
    if (context.request.method !== 'POST') {
      const response = new Response('Method Not Allowed', { status: 405 });
      response.headers.set('Allow', 'POST');
      return withSecurityHeaders(response);
    }

    return redirect(
      new URL(LOGIN_PATH, url),
      303,
      `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
    );
  }

  if (!signedIn) {
    const loginUrl = new URL(LOGIN_PATH, url);
    loginUrl.searchParams.set('returnTo', `${url.pathname}${url.search}${url.hash}`);
    return redirect(loginUrl, 303);
  }

  return withSecurityHeaders(await context.next());
}
