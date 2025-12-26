import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { BarcodeFormat, Result } from "@zxing/library";
import { sha3_512 } from "js-sha3";
import "./scanner.css";

export default function ZXingScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [text, setText] = useState("");
  const [type, setType] = useState("");
  const [hash, setHash] = useState("");
  const [scanned, setScanned] = useState(false);

const startScan = async () => {
  stopScan();

  setScanned(false);
  setText("");
  setType("");
  setHash("");

  const reader = new BrowserMultiFormatReader();

  controlsRef.current = await reader.decodeFromVideoDevice(
    undefined,
    videoRef.current!,
    (result) => {
      if (result) handleResult(result);
    }
  );
};


  const stopScan = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  };

  const handleResult = (result: Result) => {
    const barcodeText = result.getText();
    const format = BarcodeFormat[result.getBarcodeFormat()];

    setText(barcodeText);
    setType(format);
    setHash(sha3_512(barcodeText));
    setScanned(true);

    stopScan();
  };

  useEffect(() => {
    startScan();
    return () => stopScan();
  }, []);

  return (
    <div className="page">
      <h1>📷 ZXing Barcode Scanner</h1>

      {!scanned && (
        <div className="camera-box">
          <video ref={videoRef} className="video" />
        </div>
      )}

      {scanned && (
        <div className="result-card">
          <div className="row">
            <span className="label">Type</span>
            <span className="value">{type}</span>
          </div>

          <div className="row">
            <span className="label">Text</span>
            <span className="value wrap">{text}</span>
          </div>

          <div className="row">
            <span className="label">SHA3-512</span>
            <span className="value wrap mono">{hash}</span>
          </div>

          <button className="btn" onClick={startScan}>
            🔄 Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
