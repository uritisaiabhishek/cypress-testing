const { defineConfig } = require('cypress');
const fs = require('fs');
const XLSX = require('xlsx');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Task to write to Excel
      on('task', {
        writeExcel({ data, filePath }) {
          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Header Links');

          const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          fs.writeFileSync(filePath, buffer);
          return null;
        }
      });

      // Block external resources like analytics and tracking services
      on('before:browser:launch', (browser = {}, launchOptions) => {
        launchOptions.args.push('--disable-features=GoogleAnalytics,TrackingPixel');
        return launchOptions;
      });
      
    },
  },
});
