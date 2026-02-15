import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Helper to determine the correct executable path based on environment
async function getBrowser() {
    try {
        console.log('Environment:', process.env.NODE_ENV);

        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            // Production: Use @sparticuz/chromium
            // Note: We use type assertion because @sparticuz/chromium types can be lagging

            // Core serverless fixes
            // @ts-ignore
            if (chromium.setGraphicsMode) chromium.setGraphicsMode(false);

            const executablePath = await chromium.executablePath();
            console.log('Production Executable Path:', executablePath);

            return await puppeteer.launch({
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                ],
                defaultViewport: (chromium as any).defaultViewport || { width: 1200, height: 800 },
                executablePath,
                headless: (chromium as any).headless,
            });
        }

        // Local Development
        const executablePath =
            process.env.PUPPETEER_EXECUTABLE_PATH ||
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' ||
            '/usr/bin/google-chrome-stable' ||
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

        console.log('Local Launch Path:', executablePath);

        return await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath,
            headless: true,
        });
    } catch (error: any) {
        console.error('CRITICAL: Browser Launch Failed');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.stack) console.error('Stack Trace:', error.stack);
        throw new Error(`PDF Engine Error: ${error.message}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { html, css } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
        }

        const browser = await getBrowser();
        const page = await browser.newPage();

        // Ensure we emulate print media for consistent CSS application
        await page.emulateMediaType('print');

        // Inject a "Dark Mode Reset" style to ensure light mode variables are used
        // even if the frontend captured dark mode variables.
        const darkModeReset = `
            <style>
                :root {
                    color-scheme: light !important;
                    background-color: white !important;
                    color: #333 !important;
                }
                body {
                    background-color: white !important;
                    color: #333 !important;
                }
                /* Force standard light theme variables common in Tailwind/Shadcn */
                .dark {
                    color-scheme: light !important;
                }
                [data-theme='dark'] {
                    color-scheme: light !important;
                }
            </style>
        `;

        // Construct the full HTML document
        const fullContent = `
            <!DOCTYPE html>
            <html data-theme="light">
                <head>
                    <meta charset="UTF-8">
                    ${darkModeReset}
                    <style>
                        /* Base resets */
                        * { box-sizing: border-box; }
                        body { 
                            margin: 0; 
                            padding: 0; 
                            background: white !important; 
                            color: #333 !important;
                        }
                        
                        /* Injected Global Styles */
                        ${css}

                        /* Print-specific overrides to ensure exact fidelity */
                        @media print {
                            body { -webkit-print-color-adjust: exact !important; }
                            @page { margin: 0; }
                            
                            /* Ensure the injected content is visible even if the "not builder-layout" rule exists */
                            .builder-layout, .builder-main, .preview-panel {
                                display: block !important;
                                visibility: visible !important;
                                opacity: 1 !important;
                                background: white !important;
                            }
                        }
                    </style>
                </head>
                <body class="builder-layout">
                    <div class="builder-main">
                        <div class="preview-panel">
                            ${html}
                        </div>
                    </div>
                </body>
            </html>
        `;

        // Set content and wait for load
        await page.setContent(fullContent, {
            waitUntil: 'networkidle0', // Wait for all network connections to finish (fonts, etc.)
            timeout: 30000,
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }, // We handle margins in CSS
            preferCSSPageSize: true, // Respect @page rules
        });

        await browser.close();

        // Return PDF as submission
        // Return PDF as submission
        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
            },
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error.message },
            { status: 500 }
        );
    }
}
