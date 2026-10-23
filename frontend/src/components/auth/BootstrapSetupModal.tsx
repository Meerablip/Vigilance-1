import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Lock, QrCode, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface BootstrapSetupModalProps {
  isOpen: boolean;
  onComplete: (user: any) => void;
}

export const BootstrapSetupModal: React.FC<BootstrapSetupModalProps> = ({ isOpen, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [officerName, setOfficerName] = useState('Meera Chaudhari');
  const [email, setEmail] = useState('Meera@defence.com');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBootstrapInit();
    }
  }, [isOpen]);

  const loadBootstrapInit = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.bootstrapInit();
      setMfaSecret(res.mfa_secret);
      setQrCodeBase64(res.qr_code_base64);
      setOfficerName(res.officer_name);
      setEmail(res.email);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize master setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!totpCode || totpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code from Google Authenticator.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await apiClient.bootstrapComplete({
        email,
        officer_name: officerName,
        password,
        mfa_secret: mfaSecret,
        totp_code: totpCode.trim()
      });

      apiClient.setToken(res.access_token);
      onComplete(res.user);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 10, 0.94)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        width: '560px',
        maxHeight: '90vh',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-focus)',
        borderRadius: '3px',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '2px',
            background: '#1e2430',
            border: '1px solid #333d4e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e2e8f0'
          }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              System Initialization • Root Administrator
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Connected to Neon PostgreSQL Database
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.12)',
              border: '1px solid var(--threat-l5)',
              padding: '8px 10px',
              borderRadius: '2px',
              fontSize: '11px',
              color: 'var(--threat-l5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={13} />
              <span>{error}</span>
            </div>
          )}

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '10px',
            borderRadius: '2px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}>
            Zero users exist in the database. As the designated primary officer, establish your master credentials and enroll mandatory Multi-Factor Authentication (MFA) via <strong>Google Authenticator</strong>.
          </div>

          {/* Officer Details (Pre-filled for Meera Chaudhari) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                OFFICER NAME
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '7px 8px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                OFFICIAL WORK EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '7px 8px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          {/* Master Password */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <Lock size={11} color="var(--text-muted)" />
              <span>MASTER PASSWORD</span>
            </label>
            <input
              type="password"
              placeholder="Enter master account password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '7px 8px',
                borderRadius: '2px',
                fontSize: '11px',
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Google Authenticator QR Code Section */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '12px',
            display: 'flex',
            gap: '14px',
            alignItems: 'center'
          }}>
            {/* QR Code Container */}
            <div style={{
              width: '120px',
              height: '120px',
              background: '#fff',
              padding: '6px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {loading ? (
                <span style={{ fontSize: '9px', color: '#666' }}>Generating...</span>
              ) : qrCodeBase64 ? (
                <img src={qrCodeBase64} alt="Google Authenticator QR Code" style={{ width: '100%', height: '100%' }} />
              ) : (
                <QrCode size={48} color="#000" />
              )}
            </div>

            {/* Instruction steps */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Smartphone size={13} color="var(--status-healthy)" />
                <span>Scan with Google Authenticator</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                1. Open Google Authenticator on your mobile device.<br />
                2. Tap '+' and scan this QR code.<br />
                3. Enter the active 6-digit code below to confirm binding.
              </p>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Key: {mfaSecret || 'Generating secret...'}
              </div>
            </div>
          </div>

          {/* 6-Digit TOTP Code Verification */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <Key size={11} color="var(--status-healthy)" />
              <span>GOOGLE AUTHENTICATOR 6-DIGIT CODE</span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-active)',
                color: '#fff',
                padding: '9px',
                borderRadius: '2px',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '6px',
                textAlign: 'center',
                fontFamily: 'monospace',
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting || loading}
            style={{
              background: '#242a36',
              border: '1px solid #374254',
              color: '#e2e8f0',
              fontWeight: 700,
              fontSize: '11px',
              padding: '10px',
              borderRadius: '2px',
              cursor: submitting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              letterSpacing: '0.4px',
              marginTop: '4px'
            }}
          >
            <CheckCircle size={14} color="var(--status-healthy)" />
            <span>{submitting ? 'VERIFYING & INITIALIZING...' : 'ESTABLISH MASTER ACCOUNT'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
