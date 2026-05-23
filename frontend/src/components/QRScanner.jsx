import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner({ onScan, elementId = 'qr-reader' }) {
  const onScanRef = useRef(onScan);

  // Keep the ref updated with the latest onScan function without triggering re-renders
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const config = { fps: 10, qrbox: 250 };
    const verbose = false;
    const scanner = new Html5QrcodeScanner(elementId, config, verbose);

    scanner.render(
      (decodedText) => {
        if (onScanRef.current) {
          onScanRef.current(decodedText);
        }
        // stop/clear after a successful scan
        try {
          scanner.clear().catch(() => {});
        } catch {
          // ignore
        }
      },
      () => {
        // optional error callback - ignore or log
      },
    );

    return () => {
      try {
        scanner.clear().catch(() => {});
      } catch {
        // ignore
      }
    };
  }, [elementId]); // Only re-run if elementId changes, NOT when onScan changes

  return <div id={elementId} style={{ width: '100%' }} />;
}

export default QRScanner;
