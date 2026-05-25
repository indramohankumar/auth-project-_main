import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner({ onScan, elementId = 'qr-reader' }) {
  const onScanRef = useRef(onScan);
  const scannerRef = useRef(null);

  // Keep the ref updated with the latest onScan function without triggering re-renders
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    // Only initialize if not already initialized (protects against React StrictMode double mount)
    if (!scannerRef.current) {
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false 
      };
      
      scannerRef.current = new Html5QrcodeScanner(elementId, config, false);
      
      scannerRef.current.render(
        (decodedText) => {
          if (onScanRef.current) {
            onScanRef.current(decodedText);
          }
          // Note: We no longer clear the scanner automatically here.
          // This allows users to scan multiple codes or prevents crashes if clear() is called while scanning.
        },
        (error) => {
          // Ignore general scan errors (e.g. no code found in frame)
        }
      );
    }

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.error("Failed to clear html5QrcodeScanner. ", err);
        });
        scannerRef.current = null;
      }
    };
  }, [elementId]);

  return <div id={elementId} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }} />;
}

export default QRScanner;
