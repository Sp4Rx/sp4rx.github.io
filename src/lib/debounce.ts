// debounce.ts
import { useRef, useCallback } from 'react';

function useDebounce<T extends (...args: unknown[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedFunction = useCallback((...args: Parameters<T>) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            func(...args);
        }, delay);
    }, [func, delay]);

    return debouncedFunction;
}

export default useDebounce;
