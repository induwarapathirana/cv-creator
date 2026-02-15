import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
    try {
        const { html, css } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
        }

        // Launch headless browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        // Construct the full HTML document
        const fullContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* Base resets */
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 0; background: white; }
                        
                        /* Injected Global Styles */
                        ${css}

                        /* Print-specific overrides to ensure exact fidelity */
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                            @page { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${html}
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
        return new NextResponse(pdfBuffer, {
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
