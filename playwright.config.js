/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    webServer: {
        command: 'npm run build && npm run preview',
        port: 5001
    },
    testDir: 'tests'
};

export default config;
