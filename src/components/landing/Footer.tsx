import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-inner">
                <p className="footer-text">
                    © {new Date().getFullYear()} CV Creator. Built with ❤️ for job seekers worldwide.
                </p>
                <div className="footer-links">
                    <a href="#features">Features</a>
                    <a href="#templates">Templates</a>
                    <Link href="/builder">Builder</Link>
                </div>
            </div>
        </footer>
    );
}
