import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory({
	root: './fixtures/dev-toolbar/',
});

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Dev Toolbar', () => {
	test('dev toolbar exists in the page', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const devToolbar = page.locator('astro-dev-toolbar');
		await expect(devToolbar).toHaveCount(1);
	});

	test('shows app name on hover', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro"]');
		const appButtonTooltip = appButton.locator('.item-tooltip');
		await appButton.hover();

		await expect(appButtonTooltip).toBeVisible();
	});

	test('can open Astro app', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro"]');
		await appButton.click();

		const astroAppCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro"]');
		const astroWindow = astroAppCanvas.locator('astro-dev-toolbar-window');
		await expect(astroWindow).toHaveCount(1);
		await expect(astroWindow).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(astroWindow).not.toBeVisible();
	});

	test('xray shows highlights and tooltips', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:xray"]');
		await appButton.click();

		const xrayCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:xray"]');
		const xrayHighlight = xrayCanvas.locator('astro-dev-toolbar-highlight');
		await expect(xrayHighlight).toBeVisible();

		await xrayHighlight.hover();
		const xrayHighlightTooltip = xrayHighlight.locator('astro-dev-toolbar-tooltip');
		await expect(xrayHighlightTooltip).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(xrayHighlight).not.toBeVisible();
		await expect(xrayHighlightTooltip).not.toBeVisible();
	});

	test('xray shows no islands message when there are none', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/xray-no-islands'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:xray"]');
		await appButton.click();

		const xrayCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:xray"]');
		const auditHighlight = xrayCanvas.locator('astro-dev-toolbar-highlight');
		await expect(auditHighlight).not.toBeVisible();

		const xrayWindow = xrayCanvas.locator('astro-dev-toolbar-window');
		await expect(xrayWindow).toHaveCount(1);
		await expect(xrayWindow).toBeVisible();

		await expect(xrayWindow.locator('astro-dev-toolbar-icon[icon=lightbulb]')).toBeVisible();
	});

	test('audit shows higlights and tooltips', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlight = auditCanvas.locator('astro-dev-toolbar-highlight');
		await expect(auditHighlight).toBeVisible();

		await auditHighlight.hover();
		const auditHighlightTooltip = auditHighlight.locator('astro-dev-toolbar-tooltip');
		await expect(auditHighlightTooltip).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(auditHighlight).not.toBeVisible();
		await expect(auditHighlightTooltip).not.toBeVisible();
	});

	test('audit shows no issues message when there are no issues', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/audit-no-warning'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlight = auditCanvas.locator('astro-dev-toolbar-highlight');
		await expect(auditHighlight).not.toBeVisible();

		const auditWindow = auditCanvas.locator('astro-dev-toolbar-window');
		await expect(auditWindow).toHaveCount(1);
		await expect(auditWindow).toBeVisible();

		await expect(auditWindow.locator('astro-dev-toolbar-icon[icon=check-circle]')).toBeVisible();
	});

	test('adjusts tooltip position if off-screen', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/tooltip-position'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');
		for (const highlight of await auditHighlights.all()) {
			await expect(highlight).toBeVisible();
			await highlight.hover();
			const tooltip = highlight.locator('astro-dev-toolbar-tooltip');
			await expect(tooltip).toBeVisible();
			const tooltipBox = await tooltip.boundingBox();
			const { clientWidth, clientHeight } = await page.evaluate(() => ({
				clientWidth: document.documentElement.clientWidth,
				clientHeight: document.documentElement.clientHeight,
			}));
			expect(tooltipBox.x + tooltipBox.width).toBeLessThan(clientWidth);
			expect(tooltipBox.y + tooltipBox.height).toBeLessThan(clientHeight);
		}
	});

	test('can open Settings app', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await appButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]'
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toHaveCount(1);
		await expect(settingsWindow).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(settingsWindow).not.toBeVisible();
	});

	test('Opening a app closes the currently opened app', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		let appButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await appButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]'
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toHaveCount(1);
		await expect(settingsWindow).toBeVisible();

		// Click the astro app
		appButton = toolbar.locator('button[data-app-id="astro"]');
		await appButton.click();

		const astroAppCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro"]');
		const astroWindow = astroAppCanvas.locator('astro-dev-toolbar-window');
		await expect(astroWindow).toHaveCount(1);
		await expect(astroWindow).toBeVisible();

		await expect(settingsWindow).not.toBeVisible();
	});

	test('Settings app contains message on disabling the toolbar', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		let appButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await appButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]'
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toHaveCount(1);
		await expect(settingsWindow).toBeVisible();

		const hideToolbar = settingsWindow.getByRole('heading', { name: 'Hide toolbar' });
		await expect(hideToolbar).toBeVisible();
	});
});
