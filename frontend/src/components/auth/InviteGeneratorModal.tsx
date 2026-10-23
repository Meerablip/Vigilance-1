import React, { useState } from 'react';
import { X, UserPlus, Copy, Check, ShieldCheck, Clock, MapPin, Key } from 'lucide-react';
import type { UserRole } from '../../types';

interface InviteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteGeneratorModal: React.FC<InviteGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('operator');
  const [selectedRegion, setSelectedRegion] = useState<string>('Northern Frontier Command');
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    // Generate secure simulated token
    const tokenPayload = {
      role: selectedRole,
      region: selectedRegion,
      exp: Date.now() + expiryHours * 3600 * 1000,
      salt: Math.random().toString(36).substring(2, 10)
    };
    const encodedToken = btoa(JSON.stringify(tokenPayload));
    const origin = window.location.origin || 'http://localhost:5173';
    const link = `${origin}/signup?invite_token=${encodedToken}`;
    setGeneratedLink(link);
    setCopied(false);
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: '500px',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-focus)',
        borderRadius: '6px',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          height: '46px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: 'var(--accent-cyan-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <UserPlus size={14} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.4px' }}>
              GENERATE PRIVATE ONBOARDING INVITE
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            background: 'rgba(0, 210, 255, 0.05)',
            border: '1px solid rgba(0, 210, 255, 0.2)',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}>
            <ShieldCheck size={14} color="var(--accent-cyan)" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Public registration is disabled. You are generating a single-use cryptographically bound onboarding token. The user will be required to configure Multi-Factor Authentication (MFA) upon account creation.
          </div>

          {/* Role Selection */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Key size={12} color="var(--accent-cyan)" />
              <span>ASSIGNED ROLE & PERMISSION LEVEL</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="operator">Operator (Surveillance, Live Feeds & Triage)</option>
              <option value="supervisor">Supervisor / Commander (Full Authorization & Escalation)</option>
              <option value="analyst">Analyst (Sensor Fusion, Trends & Model Performance)</option>
              <option value="auditor">Auditor (Tamper-Evident History & Verification Only)</option>
              <option value="administrator">System Administrator (Full System & Policy Config)</option>
            </select>
          </div>

          {/* Region / Location Scope */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <MapPin size={12} color="var(--accent-cyan)" />
              <span>PERMITTED OPERATIONAL SECTOR</span>
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Northern Frontier Command">Northern Frontier Command</option>
              <option value="Western Maritime Base">Western Maritime Base</option>
              <option value="Eastern Line Perimeter">Eastern Line Perimeter</option>
              <option value="Central Strategic Depot">Central Strategic Depot</option>
              <option value="All Monitored Sectors">All Monitored Sectors (National Access)</option>
            </select>
          </div>

          {/* Expiration Window */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Clock size={12} color="var(--accent-cyan)" />
              <span>TOKEN EXPIRATION TIMEFRAME</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { h: 1, label: '1 Hour' },
                { h: 24, label: '24 Hours' },
                { h: 168, label: '7 Days' }
              ].map(opt => (
                <button
                  key={opt.h}
                  onClick={() => setExpiryHours(opt.h)}
                  style={{
                    flex: 1,
                    background: expiryHours === opt.h ? 'var(--accent-cyan-dim)' : 'var(--bg-canvas)',
                    border: expiryHours === opt.h ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    color: expiryHours === opt.h ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: expiryHours === opt.h ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)',
              border: 'none',
              color: '#000',
              fontWeight: 700,
              fontSize: '12px',
              padding: '10px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              letterSpacing: '0.4px',
              marginTop: '4px'
            }}
          >
            <Key size={14} />
            <span>GENERATE PRIVATE SIGNUP URL</span>
          </button>

          {/* Generated Link Display */}
          {generatedLink && (
            <div style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-focus)',
              borderRadius: '4px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Secure Invite URL Generated (Single-Use Token)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '6px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />

                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'var(--status-healthy)' : 'var(--accent-cyan)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Target role: <strong>{selectedRole.toUpperCase()}</strong> • Scope: <strong>{selectedRegion}</strong> • Token expires in {expiryHours}h.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
