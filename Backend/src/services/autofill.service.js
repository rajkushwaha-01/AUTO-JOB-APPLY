// src/services/autofillService.js
const puppeteer = require("puppeteer");

const openPrefilledApplication = async (applyUrl, applicantData) => {
  const browser = await puppeteer.launch({ headless: false }); // visible — user must be present
  const page = await browser.newPage();
  await page.goto(applyUrl, { waitUntil: "networkidle2" });

  // Greenhouse forms typically use these field name patterns — adjust per actual form inspection
  await safeType(page, 'input[name="job_application[first_name]"]', applicantData.firstName);
  await safeType(page, 'input[name="job_application[last_name]"]', applicantData.lastName);
  await safeType(page, 'input[name="job_application[email]"]', applicantData.email);
  await safeType(page, 'input[name="job_application[phone]"]', applicantData.phone);

  // cover letter / custom questions textarea, if present
  const coverLetterField = await page.$('textarea[name*="cover_letter"]');
  if (coverLetterField) {
    await coverLetterField.type(applicantData.tailoredCoverLetter);
  }

  // intentionally NOT clicking submit — user reviews and does that themselves
  console.log("Form pre-filled. Browser left open for user review.");
  // browser stays open; don't call browser.close() here
};

const safeType = async (page, selector, value) => {
  const field = await page.$(selector);
  if (field && value) await field.type(value);
};

module.exports = { openPrefilledApplication };