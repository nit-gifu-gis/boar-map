import { expect, test as base } from '@playwright/test';

import type { Page } from '@playwright/test';

type AuthState = 'valid' | 'none' | 'invalid';

interface ApiRequest {
  path: string;
  method: string;
  token?: string;
}

interface MockApp {
  token: string;
  requests: ApiRequest[];
}

export const samplePng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  'base64',
);

const emptyFeatures = {
  いのしし捕獲地点: [],
  わな設置地点: [],
  ワクチン散布地点: [],
  作業日報: [],
  豚熱陽性高率エリア: [],
  養豚場: [],
};

export const test = base.extend<{ authState: AuthState; app: MockApp }>({
  authState: ['valid', { option: true }],
  app: [
    async ({ page, context, baseURL, authState }, use) => {
      if (!baseURL) throw new Error('A local application baseURL is required');
      const appOrigin = new URL(baseURL).origin;
      const token = `e30.${Buffer.from(
        JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + 3600,
          user: 'K-browser',
          token: 'mock-gis',
        }),
      ).toString('base64url')}.test-signature`;
      const requests: ApiRequest[] = [];
      const unexpectedApi: string[] = [];
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      // Context routing covers popups as well as the page. No external request is continued.
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname.replace(/^\/api(?=\/)/, '');
        const headers = {
          'access-control-allow-origin': appOrigin,
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
        };
        const json = (body: unknown, status = 200) =>
          route.fulfill({
            status,
            headers,
            contentType: 'application/json',
            body: JSON.stringify(body),
          });

        // Sentry's same-origin tunnel must not forward an envelope from the Next server.
        if (path === '/monitoring' || url.hostname.endsWith('.sentry.io')) {
          await route.fulfill({ status: 204, headers });
          return;
        }

        const isApi =
          /^\/(Auth|Settings|Features|Mesh|City|Jibie|List|Image|Report|Debug|Map)\//.test(path);
        if (isApi) {
          if (request.method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers });
            return;
          }
          const accessToken = request.headers()['x-access-token'];
          requests.push({ path, method: request.method(), token: accessToken });
          switch (path) {
            case '/Auth/VerifyToken':
              await json(
                accessToken === token ? {} : { error: 'Unauthenticated' },
                accessToken === token ? 200 : 401,
              );
              return;
            case '/Auth/GetToken': {
              const credentials = request.postDataJSON() as { user_id?: string; password?: string };
              const accepted =
                credentials.user_id === 'K-browser' && credentials.password === 'browser-password';
              await json(
                accepted ? { token } : { error: 'Invalid credentials' },
                accepted ? 200 : 401,
              );
              return;
            }
            case '/Auth/DeleteToken':
              await json({});
              return;
            case '/Settings/Butanetsu':
              await json({ radius: 10, days: 180 });
              return;
            case '/Settings/Inputs':
              await json({ note_label: '備考' });
              return;
            case '/Settings/Notice':
              await json({
                last_updated: '2020-01-01T00:00:00.000Z',
                data: [
                  {
                    title: 'ブラウザ回帰テストのお知らせ',
                    content: '表示確認用のお知らせです。\n'.repeat(100),
                  },
                ],
              });
              return;
            case '/Features/GetFeaturesByExtent':
              await json(emptyFeatures);
              return;
            case '/Mesh/Search':
              await json({ hunter: [], vaccine: [], boar: [] });
              return;
            case '/Map/GetImage':
              await route.fulfill({
                status: 200,
                headers,
                contentType: 'image/png',
                body: samplePng,
              });
              return;
            default:
              unexpectedApi.push(`${request.method()} ${path}`);
              await json({ error: 'Unmocked API request' }, 501);
              return;
          }
        }

        if (url.origin === appOrigin) {
          // Do not let the image optimizer become a route around the network mock.
          const imageSource = url.searchParams.get('url');
          if (path === '/_next/image' && imageSource && !imageSource.startsWith('/')) {
            await route.abort('blockedbyclient');
            return;
          }
          await route.continue();
          return;
        }

        if (request.resourceType() === 'stylesheet') {
          await route.fulfill({ status: 200, contentType: 'text/css', body: '' });
          return;
        }
        await route.abort('blockedbyclient');
      });

      await context.addCookies([
        {
          name: 'last_geo',
          value: encodeURIComponent(JSON.stringify({ lat: 35.39135, lng: 136.722418, zoom: 17 })),
          url: baseURL,
        },
        ...(authState === 'none'
          ? []
          : [{ name: 'jwt', value: authState === 'valid' ? token : 'invalid.jwt', url: baseURL }]),
      ]);

      await use({ token, requests });
      expect(
        unexpectedApi,
        'Every application API request must have an explicit local mock',
      ).toEqual([]);
      expect(pageErrors, 'No unhandled browser errors during the migration flows').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const openNavigation = async (page: Page) => {
  if (!(await page.getByRole('link', { name: 'お知らせ', exact: true }).isVisible())) {
    await page.locator('.hamburger-line').first().click();
  }
};

export const expectMap = async (page: Page) => {
  await expect(page.locator('.leaflet-container')).toHaveCount(1);
  await expect(page.locator('.leaflet-control-zoom-in')).toBeVisible();
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible();
};
