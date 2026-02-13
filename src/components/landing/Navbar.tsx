'use client';

import { useTheme } from '@/hooks/use-theme';
import Link from 'next/link';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <div className="container-wide navbar-inner">
                <Link href="/" className="navbar-logo">
                    <div className="navbar-logo-icon">CV</div>
                    CV Creator
                </Link>
                <div className="navbar-actions">
                    <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    </button>
                    <Link href="/builder" className="btn btn-primary btn-sm">
                        Start Building
                    </Link>
                </div>
            </div>
        </nav>
    );
}
