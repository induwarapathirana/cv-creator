import { useMemo } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { sanitizeResume } from '@/utils/resume-sanitizer';

export function useActiveResume() {
    const rawResume = useResumeStore((state) => state.getActiveResume());
    return useMemo(() => {
        return rawResume ? sanitizeResume(rawResume) : null;
    }, [rawResume]);
}
