import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import type { PageId } from '../../types';

interface AgentsModelsViewProps {
  onNavigate?: (page: PageId) => void;
}

export const AgentsModelsView: React.FC<AgentsModelsViewProps> = ({ onNavigate: _onNavigate }) => {
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [models] = useState([
    {
      id: 'MDL-YOLO-VISDRONE',
      name: 'YOLOv8n VisDrone Aerial Incursion Detector',
      source: 'Hugging Face Hub (ultralytics/yolov8n-visdrone)',
      classes: 'Pedestrian, People, Bicycle, Car, Van, Truck, Tricycle, Bus, Motor',
      mAP: '94.2%',
      latency: '22ms',
      precision: 'FP16 TensorRT',
      status: 'ACTIVE_INFERENCE'
    },
    {
      id: 'MDL-FLIR-THERMAL',
      name: 'FLIR Infrared Combustion Signature Classifier',
      source: 'VIGILANCE Defense Weights Repository',
      classes: 'Vehicle Combustion, Exhaust Plume, Personnel Thermal Signature',
      mAP: '91.8%',
      latency: '14ms',
      precision: 'INT8 Quantized',
      status: 'ACTIVE_INFERENCE'
    },
    {
      id: 'MDL-BYTETRACK-FUSION',
      name: 'ByteTrack Multi-Target Association Engine',
      source: 'ByteTrack IoU Kalmar Matrix Pipeline',
      classes: 'Continuous Track ID Association (Zero ID Switches < 5s Occlusion)',
      mAP: '98.6%',
      latency: '4ms',
      precision: 'C++ Native Runtime',
      status: 'ACTIVE_INFERENCE'
    },
    {
      id: 'MDL-ACOUSTIC-SEISMIC',
      name: 'Acoustic Resonance Spectrogram Classifier',
      source: 'Seismic Tripwire Defense Hub Weights',
      classes: 'Combustion Engine (142 Hz), Heavy Treads (88 Hz), Personnel Footfall',
      mAP: '89.4%',
      latency: '8ms',
      precision: 'FP32 CUDA',
      status: 'ACTIVE_INFERENCE'
    }
  ]);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setToastMessage('Neural weights calibrated successfully. Zero inference drift detected.');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas, #0a0b0d)',
      color: '#f8fafc',
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono, monospace)'
    }}>
      {/* Header */}
      <div style={{
        height: '52px',
        background: 'var(--bg-surface-elevated, #181a1f)',
        borderBottom: '1px solid var(--border-subtle, #23262e)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            NEURAL MODELS & COMPUTER VISION INFERENCE WORKERS
          </h2>
          <span style={{
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            color: 'var(--military-green-highlight, #a4cbb4)',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '2px'
          }}>
            HUGGING FACE READY
          </span>
        </div>

        <button
          onClick={handleCalibrate}
          disabled={isCalibrating}
          style={{
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border-focus, #366147)',
            color: 'var(--military-green-highlight, #a4cbb4)',
            padding: '6px 14px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: isCalibrating ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={12} className={isCalibrating ? 'animate-spin' : ''} />
          <span>{isCalibrating ? 'CALIBRATING WEIGHTS...' : 'RE-CALIBRATE INFERENCE'}</span>
        </button>
      </div>

      {toastMessage && (
        <div style={{
          background: 'rgba(24, 44, 32, 0.95)',
          borderBottom: '1px solid #22c55e',
          color: '#86efac',
          padding: '8px 20px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700
        }}>
          <CheckCircle2 size={14} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Model Cards Grid */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: '12px'
      }}>
        {models.map(m => (
          <div
            key={m.id}
            style={{
              background: 'var(--bg-surface, #141518)',
              border: '1px solid var(--border-subtle, #23262e)',
              borderRadius: '2px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--military-green-text, #84b699)', fontWeight: 800 }}>{m.id}</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>{m.name}</h3>
              </div>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                color: '#86efac',
                fontSize: '8px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '2px'
              }}>
                {m.status}
              </span>
            </div>

            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              ORIGIN: <strong style={{ color: '#cbd5e1' }}>{m.source}</strong>
            </div>

            <div style={{ fontSize: '10px', color: '#64748b', background: 'var(--bg-card, #131417)', padding: '8px', borderRadius: '2px' }}>
              CLASSES: {m.classes}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '10px' }}>
              <div><span style={{ color: '#64748b' }}>mAP SCORE:</span> <strong style={{ color: '#22c55e' }}>{m.mAP}</strong></div>
              <div><span style={{ color: '#64748b' }}>LATENCY:</span> <strong style={{ color: '#38bdf8' }}>{m.latency}</strong></div>
              <div><span style={{ color: '#64748b' }}>PRECISION:</span> <strong style={{ color: '#f8fafc' }}>{m.precision}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
