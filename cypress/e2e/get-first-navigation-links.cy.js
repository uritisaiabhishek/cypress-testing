describe('Export deduplicated links from multiple websites to one Excel', () => {
  it('Extracts links from Header and Footer of each site with custom country labels', () => {
    const websites = [
      { url: 'https://www.example.com', label: 'Test' },
    ];

    const sections = [
      { name: 'Header', selector: 'header a' },
      { name: 'Footer', selector: 'footer a' },
    ];

    // Handle uncaught exceptions to prevent them from failing the test
    Cypress.on('uncaught:exception', (err, runnable) => {
      // Return false to prevent test failure on uncaught exceptions
      return false;
    });

    // Block external resources like analytics and tracking services
    cy.intercept('**/google-analytics.com/**', { statusCode: 200 }).as('googleAnalytics');
    cy.intercept('**/connect.facebook.net/**', { statusCode: 200 }).as('facebookPixel');
    cy.intercept('**/www.googletagmanager.com/**', { statusCode: 200 }).as('gtm');
    cy.intercept('**/clarity.ms/**', { statusCode: 200 }).as('clarityMS');
    cy.intercept('**/factors.ai/**', { statusCode: 200 }).as('factorsAI');
    cy.intercept('**/sprouts.ai/**', { statusCode: 200 }).as('sproutsAI');
    cy.intercept('**/linkedin.com/**', { statusCode: 200 }).as('linkedin');
    cy.intercept('**/facebook.com/**', { statusCode: 200 }).as('facebook');
    cy.intercept('**/twitter.com/**', { statusCode: 200 }).as('twitter');
    // Add more social media and analytics URLs to block as needed

    cy.wrap(websites).each(website => {
      cy.visit(website.url);

      let allLinks = [];
      let seenUrls = new Set();

      cy.wrap(sections).each(section => {
        cy.get(section.selector).each($link => {

          // Check if the link is visible and not a duplicate
          const linkText = $link.text().trim();
          const href = $link.prop('href')?.trim();

          if (
            href &&
            href !== '#' &&
            !href.endsWith('#') &&
            !seenUrls.has(href) &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            !href.includes('facebook.com') &&
            !href.includes('linkedin.com') &&
            !href.includes('twitter.com') &&
            !href.includes('instagram.com') &&
            !href.includes('youtube.com')
          ) {
            seenUrls.add(href);
            allLinks.push({
              Website: website.label, // Using the custom label here
              Section: section.name,
              'Link Text': linkText,
              URL: href
            });
          }

          cy.task('writeExcel', {
            data: allLinks,
            filePath: `cypress/output/page-first-flow-urls-header-footer/${website.label}.xlsx`
          });

        });
      });
    });
  });
});
