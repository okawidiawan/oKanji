import { useState, useEffect } from "react";

/**
 * Custom hook untuk menangani debounce value.
 * Berguna untuk menunda eksekusi update state (seperti search) hingga user selesai mengetik.
 * 
 * @param {any} value - Nilai yang ingin di-debounce.
 * @param {number} delay - Waktu tunggu dalam milidetik.
 * @returns {any} Nilai yang sudah di-debounce.
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout untuk mengupdate debouncedValue setelah delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: batalkan timeout jika value atau delay berubah sebelum delay selesai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
