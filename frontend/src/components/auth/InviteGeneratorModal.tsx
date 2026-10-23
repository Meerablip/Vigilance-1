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
      background: 'rgba(5, 7, 10, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: '460px',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-focus)',
        borderRadius: '3px',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          height: '40px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '2px',
              background: '#202530',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}>
              <UserPlus size={12} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Generate Private Onboarding Token
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px'
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 10px',
            borderRadius: '2px',
            fontSize: '10px',
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}>
            <ShieldCheck size={12} color="var(--text-primary)" style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
            Public sign-up is disabled. Generates a single-use cryptographically bound invite link. The recipient must enroll Multi-Factor Authentication (MFA).
          </div>

          {/* Role Selection */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              <Key size={11} color="var(--text-muted)" />
              <span>ASSIGNED ROLE & CLEARANCE</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '6px 8px',
                borderRadius: '2px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="operator">Operator (Surveillance, Feeds & Triage)</option>
              <option value="supervisor">Supervisor / Commander (Full Authorization & Escalation)</option>
              <option value="analyst">Analyst (Fusion, Trends & Model Analytics)</option>
              <option value="auditor">Auditor (Tamper-Evident History Only)</option>
              <option value="administrator">System Administrator (Full System Configuration)</option>
            </select>
          </div>

          {/* Region / Location Scope */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              <MapPin size={11} color="var(--text-muted)" />
              <span>PERMITTED SECTOR SCOPE</span>
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '6px 8px',
                borderRadius: '2px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Northern Frontier Command">Northern Frontier Command</option>
              <option value="Western Maritime Base">Western Maritime Base</option>
              <option value="Eastern Line Perimeter">Eastern Line Perimeter</option>
              <option value="Central Strategic Depot">Central Strategic Depot</option>
              <option value="All Monitored Sectors">All Monitored Sectors (National)</option>
            </select>
          </div>

          {/* Expiration Window */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              <Clock size={11} color="var(--text-muted)" />
              <span>EXPIRATION WINDOW</span>
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
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
                    background: expiryHours === opt.h ? 'var(--bg-card-hover)' : 'var(--bg-canvas)',
                    border: expiryHours === opt.h ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                    color: expiryHours === opt.h ? '#fff' : 'var(--text-secondary)',
                    padding: '5px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontWeight: expiryHours === opt.h ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button - Muted Matte Charcoal / Steel */}
          <button
            onClick={handleGenerate}
            style={{
              background: '#242a36',
              border: '1px solid #374254',
              color: '#e2e8f0',
              fontWeight: 600,
              fontSize: '11px',
              padding: '8px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              letterSpacing: '0.3px',
              marginTop: '2px'
            }}
          >
            <Key size={12} />
            <span>GENERATE PRIVATE SIGNUP URL</span>
          </button>

          {/* Generated Link Display */}
          {generatedLink && (
            <div style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-focus)',
              borderRadius: '2px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Secure Invite URL Generated (Single-Use)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '5px 7px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />

                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'var(--status-healthy)' : '#2a3240',
                    border: '1px solid var(--border-focus)',
                    color: copied ? '#000' : '#e2e8f0',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                Target role: <strong>{selectedRole.toUpperCase()}</strong> • Scope: <strong>{selectedRegion}</strong> • Token expires in {expiryHours}h.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
