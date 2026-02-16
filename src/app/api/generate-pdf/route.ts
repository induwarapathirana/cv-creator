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
        const { resume } = await req.json();

        if (!resume) {
            return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });
        }

        const browser = await getBrowser();
        const page = await browser.newPage();

        // 1. Get the current origin to navigate back to our own site
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const host = req.headers.get('host');
        const exportUrl = `${protocol}://${host}/export`;

        console.log('Export URL:', exportUrl);

        // 2. Inject the data before the page loads
        // This ensures the client-side code has the data as soon as it mounts
        await page.evaluateOnNewDocument((data) => {
            window.__RESUME_DATA__ = data;
        }, resume);

        // 3. Navigate to the export page
        await page.goto(exportUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        // 4. Ensure we emulate print media for consistent CSS application
        await page.emulateMediaType('print');

        // 5. Wait for the resume to actually be rendered
        // We look for a common element in all templates
        try {
            await page.waitForSelector('.resume-page', { timeout: 10000 });
        } catch (e) {
            console.warn('Warning: .resume-page selector not found, attempting PDF anyway');
        }

        // 6. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            preferCSSPageSize: true,
        });

        await page.close();

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
