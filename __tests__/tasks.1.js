const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const browserOptions = {
  headless: true,
  ignoreHTTPSErrors: true,
};

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch(browserOptions);
  page = await browser.newPage();
  await page.goto('file://' + path.resolve('./index.html'));
});

afterAll((done) => {
  try {
    this.puppeteer.close();
  } catch (e) {}
  done();
});

describe('Browser Fetch Async', () => {
  it('Javascript file should be linked using script tag', async () => {
    const scriptTags = await page.$$('script[src$=".js"]');
    expect(scriptTags).toBeTruthy();
  });

  it('Promise handling the model popup should be converted to `async/await`', async () => {
    const indexFileContents = fs
      .readFileSync('./index.js')
      .toString('utf-8');
    expect(indexFileContents).toMatch(/(?:async\s+)?(?:function\s*\*?\s*[\w]*\s*\(.*\)|\(\s*.*\s*\)\s*=>)\s*\{[\s\S]*?await[\s\S]*?\}/g);
  });

  it('Modal should appear after 5 seconds', async () => {
    const modal = await page.waitForSelector('#myModal');
    expect(modal).toBeTruthy();
    await page.waitForTimeout(5200);
    const modalDisplay = await page.evaluate(() => {
      return getComputedStyle(document.getElementById('myModal')).display;
    });
    expect(modalDisplay).toBe('block');
    //await page.screenshot({ path: 'screenshot.png' }, {fullPage: true});
  }, 5500);

  it("Modal should contain a 'close' button which sets the modal's display to none", async () => {
    const modal = await page.waitForSelector('.modal__content');
    expect(modal).toBeTruthy();
    const closeButton = await page.$('.modal__content .close');
    await closeButton.click();
    const modalDisplay = await page.evaluate(() => {
      return getComputedStyle(document.getElementById('myModal')).display;
    });
    expect(modalDisplay).toBe('none');
    //await page.screenshot({ path: 'screenshot2.png' }, {fullPage: true});
  });

  it("'animation-duration' property should be defined for 'Continue' button", async () => {
    const continueBtn = await page.$('#continue');
    await continueBtn.hover();
    const continueBtnAnimation = await page.$eval(
      '#continue',
      (el) => getComputedStyle(el).animationDuration
    );
    expect(continueBtnAnimation).toBeTruthy();
  });
});

describe('Alert Dialog', () => {
  it("Upon animation end, page should display an alert saying 'Continue to subscription!'", async () => {
    const dialogDismissed = new Promise((resolve, reject) => {
      const handler = async (dialog) => {
        await dialog.dismiss();
        resolve(dialog.message());
      };
      page.once('dialog', handler);
    });
    const continueBtn = await page.$('#continue');
    await continueBtn.click();
    const msg = await dialogDismissed;
    expect(msg).toBe('Continue to subscription!');
  });

  it("Upon animation end 'Continue' button's background color should change", async () => {
    const continueBtnColor = await page.$eval(
      '#continue',
      (el) => getComputedStyle(el).backgroundColor
    );
    await page.hover('#continue');
    const continueBtnColorAfterHover = await page.$eval(
      '#continue',
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(continueBtnColorAfterHover).not.toBe(continueBtnColor);
  });
});
