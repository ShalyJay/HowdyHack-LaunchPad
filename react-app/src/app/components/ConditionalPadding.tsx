'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ConditionalPadding({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            // Remove padding-top on home page, add it on other pages
            if (pathname === '/') {
                document.body.style.paddingTop = '0';
            } else {
                document.body.style.paddingTop = '80px';
            }
        }
    }, [pathname, mounted]);

    return <>{children}</>;
}
