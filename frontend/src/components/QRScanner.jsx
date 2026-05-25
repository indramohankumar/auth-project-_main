import { Scanner } from '@yudiel/react-qr-scanner';

function QRScanner({ onScan }) {
  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'hidden', borderRadius: '16px' }}>
      <Scanner 
        onScan={(result) => {
          // Handle both v1 (string) and v2 (array of objects) of the library
          if (Array.isArray(result) && result.length > 0) {
            onScan(result[0].rawValue);
          } else if (typeof result === 'string') {
            onScan(result);
          }
        }} 
        onError={(error) => {
          console.error("QR Scan Error:", error?.message || error);
        }}
        components={{
          audio: false,
          finder: true,
        }}
      />
    </div>
  );
}

export default QRScanner;
