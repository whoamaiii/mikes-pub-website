import { createHmac } from 'node:crypto';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { onRequest } from '../../functions/_middleware';

const password = 'four-quiet-lanterns-2026';

function context(
  path: string,
  init: RequestInit = {},
  secret: string | undefined = password,
  next = vi.fn(async () => new Response('private site', { status: 200 })),
) {
  return {
    request: new Request(`https://www.mikespub.no${path}`, init),
    env: { PREVIEW_PASSWORD: secret },
    next,
  };
}

describe('private preview middleware', () => {
  afterEach(() => vi.restoreAllMocks());

  async function loginCookie(): Promise<string> {
    const login = await onRequest(
      context('/__preview', { method: 'POST', body: new URLSearchParams({ password }) }),
    );
    expect(login.status).toBe(303);
    return login.headers.get('Set-Cookie')!.split(';')[0];
  }

  test('expires a replayed session on the server after seven days, including asset requests', async () => {
    const issuedAt = Date.UTC(2026, 8, 6, 12);
    const now = vi.spyOn(Date, 'now').mockReturnValue(issuedAt);
    const cookie = await loginCookie();
    now.mockReturnValue(issuedAt + 604_800_000 - 1);
    expect((await onRequest(context('/program', { headers: { Cookie: cookie } }))).status).toBe(
      200,
    );

    for (const elapsed of [604_800_000, 365 * 86_400_000]) {
      now.mockReturnValue(issuedAt + elapsed);
      for (const path of ['/program', '/_astro/site.css']) {
        const next = vi.fn(async () => new Response('private'));
        const response = await onRequest(
          context(path, { headers: { Cookie: cookie } }, password, next),
        );
        expect(response.status).toBe(303);
        expect(next).not.toHaveBeenCalled();
      }
    }
  });

  test('issues distinct sessions and rejects altered, future, legacy and rotated-password tokens', async () => {
    const issuedAt = Date.UTC(2026, 8, 6, 12);
    const now = vi.spyOn(Date, 'now').mockReturnValue(issuedAt);
    const cookie = await loginCookie();
    expect(await loginCookie()).not.toBe(cookie);
    const token = cookie.split('=')[1];
    const parts = token.split('.');
    parts[2] = String(Number(parts[2]) + 604_800);
    const tampered = `${cookie.split('=')[0]}=${parts.join('.')}`;
    const legacy = createHmac('sha256', password)
      .update('mikes-pub-private-preview-v1')
      .digest('base64url');
    for (const invalid of [tampered, `${cookie.split('=')[0]}=${legacy}`, `${cookie}.extra`]) {
      expect((await onRequest(context('/program', { headers: { Cookie: invalid } }))).status).toBe(
        303,
      );
    }
    expect(
      (
        await onRequest(
          context('/program', { headers: { Cookie: cookie } }, 'replacement-local-test-passphrase'),
        )
      ).status,
    ).toBe(303);
    now.mockReturnValue(issuedAt - 1_000);
    expect((await onRequest(context('/program', { headers: { Cookie: cookie } }))).status).toBe(
      303,
    );
  });

  test('fails closed when the password secret is missing', async () => {
    const next = vi.fn(async () => new Response('must stay private'));
    const response = await onRequest({
      request: new Request('https://www.mikespub.no/'),
      env: {},
      next,
    });

    expect(response.status).toBe(503);
    expect(await response.text()).toContain('ikke konfigurert');
    expect(next).not.toHaveBeenCalled();
  });

  test('redirects every unauthenticated route to the password screen', async () => {
    const response = await onRequest(context('/program?kategori=sport'));
    const location = new URL(response.headers.get('Location') ?? '');

    expect(response.status).toBe(303);
    expect(location.origin).toBe('https://www.mikespub.no');
    expect(location.pathname).toBe('/__preview');
    expect(location.searchParams.get('returnTo')).toBe('/program?kategori=sport');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow, noarchive');
  });

  test('renders an accessible, non-indexable Norwegian password screen', async () => {
    const response = await onRequest(context('/__preview?returnTo=%2Fprogram'));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Security-Policy')).toContain("form-action 'self'");
    expect(html).toContain('lang="no"');
    expect(html).toContain('Privat forhåndsvisning');
    expect(html).toContain('<label for="password">Passord</label>');
    expect(html).toContain('Ikke den offisielle nettsiden');
    expect(html).toContain('name="robots" content="noindex, nofollow, noarchive"');
  });

  test('rejects a wrong password without setting a session cookie', async () => {
    const body = new URLSearchParams({ password: 'wrong-password' });
    const response = await onRequest(
      context('/__preview?returnTo=%2Fprogram', { method: 'POST', body }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(await response.text()).toContain('Passordet var ikke riktig');
  });

  test.each(['', 'short'])(
    'rejects an empty or short password without a server error (%j)',
    async (candidate) => {
      const response = await onRequest(
        context('/__preview', {
          method: 'POST',
          body: new URLSearchParams({ password: candidate }),
        }),
      );
      expect(response.status).toBe(401);
      expect(response.headers.get('Set-Cookie')).toBeNull();
    },
  );

  test('sets a hardened cookie and serves assets only after authentication', async () => {
    const body = new URLSearchParams({ password });
    const login = await onRequest(
      context('/__preview?returnTo=%2Fprogram', { method: 'POST', body }),
    );
    const setCookie = login.headers.get('Set-Cookie') ?? '';
    const sessionCookie = setCookie.split(';')[0];

    expect(login.status).toBe(303);
    expect(login.headers.get('Location')).toBe('https://www.mikespub.no/program');
    expect(setCookie).toContain('__Host-mikes-pub-preview=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('SameSite=Strict');
    expect(setCookie).toContain('Max-Age=604800');

    const next = vi.fn(async () => new Response('body { color: white }', { status: 200 }));
    const asset = await onRequest(
      context('/_astro/site.css', { headers: { Cookie: sessionCookie } }, password, next),
    );

    expect(asset.status).toBe(200);
    expect(await asset.text()).toContain('color: white');
    expect(asset.headers.get('Cache-Control')).toBe('private, no-store, max-age=0');
    expect(asset.headers.get('X-Frame-Options')).toBe('DENY');
    expect(next).toHaveBeenCalledOnce();
  });

  test('never redirects to a different origin after login', async () => {
    const body = new URLSearchParams({ password });
    const response = await onRequest(
      context('/__preview?returnTo=https%3A%2F%2Fevil.example%2F', { method: 'POST', body }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('https://www.mikespub.no/');
  });

  test('clears the session cookie on logout', async () => {
    const response = await onRequest(context('/__preview/logout', { method: 'POST' }));
    const setCookie = response.headers.get('Set-Cookie') ?? '';

    expect(response.status).toBe(303);
    expect(setCookie).toContain('__Host-mikes-pub-preview=;');
    expect(setCookie).toContain('Max-Age=0');
  });
});
