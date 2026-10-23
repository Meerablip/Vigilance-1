import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { apiClient } from '../../api/client';

interface InviteSignupModalProps {
  inviteToken: string | null;
  onClose: () => void;
  onComplete: (user: any) => void;
}

export const InviteSignupModal: React.FC<InviteSignupModalProps> = ({
  inviteToken,
  onClose,
  onComplete
}) => {
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [assignedRole, setAssignedRole] = useState('');
  const [assignedSector, setAssignedSector] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [officerName, setOfficerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [mfaLoaded, setMfaLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (inviteToken) {
      validateToken();
    }
  }, [inviteToken]);

  const validateToken = async () => {
    try {
      setValidating(true);
      setError(null);
      const res = await apiClient.validateInvite(inviteToken!);
      if (res.valid) {
        setTokenValid(true);
        setAssignedRole(res.role);
        setAssignedSector(res.sector);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired invite token.');
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleGenerateMFA = async () => {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid official email address first.');
      return;
    }
    try {
      setError(null);
      const res = await apiClient.getInviteMfaInit(email);
      setMfaSecret(res.mfa_secret);
      setQrCodeBase64(res.qr_code_base64);
      setMfaLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate MFA QR code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaLoaded) {
      setError('Please click Generate Google Authenticator QR first.');
      return;
    }
    if (!totpCode || totpCode.trim().length !== 6) {
      setError('Please enter the 6-digit Google Authenticator code.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await apiClient.registerInvite({
        invite_token: inviteToken!,
        email,
        officer_name: officerName,
        password,
        mfa_secret: mfaSecret,
        totp_code: totpCode.trim()
      });

      apiClient.setToken(res.access_token);
      onComplete(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!inviteToken) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 10, 0.9)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        width: '520px',
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
          padding: '12px 14px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--status-healthy)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Private Onboarding • Authorized Invite
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>

        {validating ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '11px' }}>
            Validating single-use cryptographic token...
          </div>
        ) : !tokenValid ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid var(--threat-l5)', padding: '10px', borderRadius: '2px', color: 'var(--threat-l5)', fontSize: '11px' }}>
              <AlertTriangle size={13} style={{ display: 'inline', marginRight: '5px' }} />
              {error || 'This invite link is invalid or has already been used.'}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {error && (
              <div style={{ background: 'rgba(220, 38, 38, 0.12)', border: '1px solid var(--threat-l5)', padding: '8px', borderRadius: '2px', fontSize: '10px', color: 'var(--threat-l5)' }}>
                {error}
              </div>
            )}

            {/* Locked Role & Sector Indicator */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 10px',
              borderRadius: '2px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px'
            }}>
              <div>Assigned Role: <strong style={{ color: '#fff', textTransform: 'uppercase' }}>{assignedRole}</strong></div>
              <div>Sector: <strong style={{ color: 'var(--text-secondary)' }}>{assignedSector}</strong></div>
            </div>

            {/* Officer Inputs */}
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                FULL OFFICER NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Officer A. Verma"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                OFFICIAL WORK EMAIL
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="email"
                  placeholder="officer@defence.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '6px 8px',
                    borderRadius: '2px',
                    fontSize: '11px',
                    outline: 'none'
                  }}
                  required
                />
                {!mfaLoaded && (
                  <button
                    type="button"
                    onClick={handleGenerateMFA}
                    style={{
                      background: '#242a36',
                      border: '1px solid #374254',
                      color: '#e2e8f0',
                      fontSize: '10px',
                      padding: '0 8px',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    Setup MFA
                  </button>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="Account password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Google Authenticator QR Code */}
            {mfaLoaded && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
                padding: '10px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{ width: '100px', height: '100px', background: '#fff', padding: '4px', flexShrink: 0 }}>
                  <img src={qrCodeBase64} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                </div>
                <div style={{ flex: 1, fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  <strong style={{ color: '#fff' }}>Scan with Google Authenticator</strong><br />
                  Scan with your phone app and enter the 6-digit code below to confirm account binding.
                </div>
              </div>
            )}

            {mfaLoaded && (
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                  GOOGLE AUTHENTICATOR 6-DIGIT CODE
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
                    padding: '8px',
                    borderRadius: '2px',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '5px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !mfaLoaded}
              style={{
                background: '#242a36',
                border: '1px solid #374254',
                color: '#e2e8f0',
                fontWeight: 700,
                fontSize: '11px',
                padding: '9px',
                borderRadius: '2px',
                cursor: submitting || !mfaLoaded ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <CheckCircle size={13} color="var(--status-healthy)" />
              <span>{submitting ? 'COMPLETING REGISTRATION...' : 'REGISTER OFFICER ACCOUNT'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
