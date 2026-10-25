import { expect, expectMap, openNavigation, samplePng, test } from './fixtures';

test.describe('authentication without an existing cookie', () => {
  test.use({ authState: 'none' });

  test('a protected page redirects to login, then a login creates shared user state', async ({
    page,
    app,
    context,
  }) => {
    await page.goto('/map');
    await expect(page).toHaveURL(/\/login$/);
    await page.getByPlaceholder('ユーザーID', { exact: true }).fill('K-browser');
    await page.getByPlaceholder('パスワード', { exact: true }).fill('browser-password');
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expectMap(page);
    expect((await context.cookies()).find((cookie) => cookie.name === 'jwt')?.value).toBe(
      app.token,
    );
    expect(
      app.requests.some(
        (request) => request.path === '/Auth/VerifyToken' && request.token === app.token,
      ),
    ).toBe(true);
  });
});

test.describe('invalid authentication cookie', () => {
  test.use({ authState: 'invalid' });

  test('an invalid JWT is discarded and the protected page redirects without a browser exception', async ({
    page,
    context,
  }) => {
    await page.goto('/map');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByPlaceholder('ユーザーID', { exact: true })).toBeVisible();
    expect((await context.cookies()).some((cookie) => cookie.name === 'jwt')).toBe(false);
  });
});

test('an authenticated login visit redirects to a map that survives Link navigation and resize', async ({
  page,
  app,
}) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/map$/);
  await expectMap(page);

  for (let visit = 0; visit < 2; visit += 1) {
    await openNavigation(page);
    await page.getByRole('link', { name: 'お知らせ', exact: true }).click();
    await expect(page).toHaveURL(/\/notice$/);
    await expect(page.getByText('ブラウザ回帰テストのお知らせ', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'マップへ戻る', exact: true }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expectMap(page);
  }

  const previousHeight = await page
    .locator('.leaflet-container')
    .evaluate((element) => element.clientHeight);
  await page.setViewportSize({ width: 900, height: 650 });
  await expect
    .poll(() => page.locator('.leaflet-container').evaluate((element) => element.clientHeight))
    .toBeLessThan(previousHeight);
  await expectMap(page);
  expect(
    app.requests.some(
      (request) => request.path === '/Features/GetFeaturesByExtent' && request.token === app.token,
    ),
  ).toBe(true);
  expect(app.requests.some((request) => request.path === '/Map/GetImage')).toBe(true);
});

test('the logout modal blocks background scrolling, cancels cleanly, and can open again to log out', async ({
  page,
  context,
  app,
}) => {
  await page.goto('/notice');
  await expect(page.getByText('ブラウザ回帰テストのお知らせ', { exact: true })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 300));
  await openNavigation(page);
  await page.getByRole('link', { name: 'ログアウト', exact: true }).click();
  const modal = page.locator('.modal-bg');
  await expect(modal).toBeVisible();
  await expect(
    modal.getByText('本当にログアウトしてよろしいですか？', { exact: true }),
  ).toBeVisible();

  const lockedScroll = await page.evaluate(() => window.scrollY);
  await page.mouse.move(30, 700);
  await page.mouse.wheel(0, 350);
  // Waiting for two frames lets the scroll event and the application's scroll lock settle.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(lockedScroll);
  await modal.getByRole('button', { name: 'キャンセル', exact: true }).click();
  await expect(modal).toHaveCount(0);
  expect((await context.cookies()).some((cookie) => cookie.name === 'jwt')).toBe(true);

  await page.mouse.move(30, 700);
  await page.mouse.wheel(0, 350);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(lockedScroll);
  await openNavigation(page);
  await page.getByRole('link', { name: 'ログアウト', exact: true }).click();
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).some((cookie) => cookie.name === 'jwt')).toBe(false);
  expect(
    app.requests.some(
      (request) => request.path === '/Auth/DeleteToken' && request.token === app.token,
    ),
  ).toBe(true);
});

test('the registration draft and a selected photo survive page changes, and an expired Blob URL is removed after reload', async ({
  page,
  app,
}) => {
  await page.goto('/map');
  await expectMap(page);
  await page.getByRole('button', { name: '新規情報登録', exact: true }).click();
  await expect(page).toHaveURL(/\/add$/);
  await page.getByText('わな情報', { exact: true }).click();
  await page.getByRole('button', { name: '進む >', exact: true }).click();
  await expect(page).toHaveURL(/\/add\/image$/);
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'draft.png', mimeType: 'image/png', buffer: samplePng });
  await expect(page.getByAltText('Local image 1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '進む >', exact: true }).click();
  await expect(page).toHaveURL(/\/add\/location$/);
  await expectMap(page);

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('formData') || '{}'));
  expect(draft.dataType).toBe('trap');
  expect(draft.isImageSkipped).toBe(false);
  expect(draft.inputData.otherImageUrls).toHaveLength(1);
  expect(draft.inputData.otherImageUrls[0].objectURL).toMatch(/^blob:/);

  await page.getByRole('button', { name: '< 戻る', exact: true }).click();
  await expect(page).toHaveURL(/\/add\/image$/);
  await expect(page.getByAltText('Local image 1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '進む >', exact: true }).click();
  await expect(page).toHaveURL(/\/add\/location$/);
  await expectMap(page);
  await page.reload();
  await expectMap(page);
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('formData') || '{}').inputData?.otherImageUrls,
      ),
    )
    .toEqual([]);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('formData') || '{}').dataType),
  ).toBe('trap');
  await page.getByRole('button', { name: '< 戻る', exact: true }).click();
  await expect(page).toHaveURL(/\/add\/image$/);
  await expect(page.getByRole('button', { name: '画像を選択', exact: true })).toBeVisible();
  await expect(page.getByAltText('Local image 1', { exact: true })).toHaveCount(0);
  expect(
    app.requests.some((request) => /\/(AddFeature|UpdateFeature|AddImage)$/.test(request.path)),
  ).toBe(false);
});
