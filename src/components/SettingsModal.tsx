
import React, { useState, useEffect, useRef } from 'react';
import { StorageSettingsView } from './settings/StorageSettings';
import { useConsent } from './consent/ConsentContext';
import { upsertWorkspaceForUser, listenWorkspaceByUser } from '../services/firestoreWorkspaces';
import { authService } from '../services/authService';
import { loggingService } from '../utils/loggingService';
import { APP_VERSION } from '../utils/appVersion';

const MAX_AVATAR_BASE64_BYTES = 300 * 1024; // Firestore document limit reserve

async function compressImageToBase64(file: File, maxBytes: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo acceder al lienzo para procesar la imagen.');

  let width = bitmap.width;
  let height = bitmap.height;
  let quality = 0.9;
  let blob = await renderBlob();

  let attempt = 0;
  while (blob.size > maxBytes && attempt < 20) {
    attempt += 1;
    if (quality > 0.35) {
      quality -= 0.05;
    } else {
      width = Math.max(64, Math.floor(width * 0.9));
      height = Math.max(64, Math.floor(height * 0.9));
    }
    blob = await renderBlob();
  }

  bitmap.close();

  if (blob.size > maxBytes) {
    throw new Error('No se pudo comprimir la imagen lo suficiente. Usa una más pequeña.');
  }

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falla al convertir la imagen a Base64.'));
    reader.readAsDataURL(blob);
  });

  async function renderBlob() {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((generated) => {
        if (!generated) {
          reject(new Error('No se pudo generar el blob de la imagen.'));
          return;
        }
        resolve(generated);
      }, 'image/jpeg', quality);
    });
  }
}

interface SettingsModalProps {
  onClose: () => void;
  userKey: string;
  onNavigate?: (view: any) => void;
}

type SettingsTab = 'general' | 'account' | 'notifications' | 'privacy' | 'ai';
type ThemeMode = 'system' | 'light' | 'dark';

interface UserSettings {
  theme: ThemeMode;
  language: string;
  notifications: {
    jobAlerts: boolean;
    applicationUpdates: boolean;
  };
  ai: {
    enabled: boolean;
    autoAnalyze: boolean;
    creativityLevel: 'low' | 'medium' | 'high';
  };
}

interface UserProfile {
  fullName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  shareToken?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, userKey, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { openModal } = useConsent();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for settings
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'es',
    notifications: {
      jobAlerts: true,
      applicationUpdates: true
    },
    ai: {
      enabled: true,
      autoAnalyze: true,
      creativityLevel: 'medium'
    }
  });

  // State for profile
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    firstName: '',
    lastName: '',
    shareToken: '',
    avatarUrl: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load settings from Firestore
  useEffect(() => {
    if (!userKey) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = listenWorkspaceByUser(
      userKey,
      (data) => {
        setIsLoading(false);
        if (data) {
          // Load settings
          if (data.settings) {
            setSettings(prev => ({
              ...prev,
              ...data.settings,
              notifications: {
                ...prev.notifications,
                ...data.settings.notifications
              }
            }));
          }

          // Load profile
          if (data.profile) {
            const nameParts = data.profile.fullName?.split(' ') || [];
            setProfile({
              fullName: data.profile.fullName || '',
              email: data.profile.email || data.email || '',
              firstName: data.profile.firstName || nameParts[0] || '',
              lastName: data.profile.lastName || nameParts.slice(1).join(' ') || '',
              avatarUrl: data.profile.avatarUrl || '',
              shareToken: data.shareToken || ''
            });
          }
        }
      },
      (error) => {
        loggingService.error('Settings sync error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userKey]);

  // Handle Avatar Upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64String = await compressImageToBase64(file, MAX_AVATAR_BASE64_BYTES);
      setProfile(prev => ({ ...prev, avatarUrl: base64String }));
      setHasChanges(true);
      loggingService.info('Avatar processed locally. Save changes to persist.');
    } catch (error: any) {
      loggingService.error('Error processing avatar', error);
      alert(error?.message || 'Error al procesar la imagen. Intenta con una más pequeña.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userKey) return;
    const confirmDeletion = window.confirm('Eliminar tu cuenta eliminará permanentemente tu perfil, configuraciones y datos. ¿Deseas continuar?');
    if (!confirmDeletion) return;

    setIsDeletingAccount(true);
    try {
      await authService.deleteAccount();
      loggingService.info('Cuenta eliminada. Redirigiendo al inicio.');
      window.location.href = '/';
    } catch (error: any) {
      loggingService.error('Failed to delete account', error);
      alert(error?.message || 'No se pudo eliminar la cuenta en este momento. Intenta de nuevo.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Save settings to Firestore
  const handleSaveChanges = async () => {
    if (!userKey || !hasChanges) return;

    setIsSaving(true);
    try {
      const updatePayload: any = {
        settings: {
          theme: settings.theme,
          language: settings.language,
          notifications: settings.notifications,
          ai: settings.ai
        },
        profile: {
          fullName: `${profile.firstName} ${profile.lastName}`.trim() || profile.fullName,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl
        },
        updatedAt: new Date().toISOString()
      };

      await upsertWorkspaceForUser(userKey, updatePayload);
      setHasChanges(false);
      loggingService.info('Settings saved successfully');
    } catch (error) {
      loggingService.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle theme change
  const handleThemeChange = (theme: ThemeMode) => {
    setSettings(prev => ({ ...prev, theme }));
    setHasChanges(true);
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: 'jobAlerts' | 'applicationUpdates') => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
    setHasChanges(true);
  };

  // Handle profile field change
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle AI settings change
  const handleAiChange = (field: keyof UserSettings['ai'], value: any) => {
    setSettings(prev => ({
      ...prev,
      ai: {
        ...prev.ai,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleGenerateToken = async () => {
    setIsSaving(true);
    try {
      const token = await authService.generateShareToken();
      setProfile(prev => ({ ...prev, shareToken: token }));
      loggingService.info('Public token generated successfully');
    } catch (error) {
      loggingService.error('Failed to generate token', error);
      alert('Could not generate public link. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: 'tune' },
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'ai', label: 'AI Config', icon: 'smart_toy' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'privacy', label: 'Privacy & Data', icon: 'security' }, // Updated label
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-[var(--md-sys-color-background)] w-full h-full md:max-w-5xl md:h-[85vh] md:rounded-[28px] shadow-elevation-3 flex flex-col md:flex-row overflow-hidden border-none md:border border-outline-variant/20 animate-fade-scale">

        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-surface-variant/50 border-b md:border-b-0 md:border-r border-outline-variant/20 p-4 md:p-6 flex flex-col shrink-0">
          <div className="flex items-center justify-between md:block mb-4 md:mb-8">
            <h2 id="settings-title" className="text-xl md:text-2xl font-display font-medium text-[var(--md-sys-color-on-background)] px-2">Settings</h2>
            <button onClick={onClose} className="md:hidden p-2 text-outline hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav role="tablist" aria-orientation="vertical" className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-2 md:py-3 rounded-full text-sm font-medium transition-all duration-200 state-layer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${activeTab === tab.id
                  ? 'bg-secondary-container text-secondary-onContainer shadow-sm'
                  : 'text-outline hover:bg-surface-variant hover:text-[var(--md-sys-color-on-background)]'
                  }`}
              >
                <span className={`material-symbols-outlined text-lg md:text-xl ${activeTab === tab.id ? 'fill-1' : ''}`} aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block mt-6 pt-6 border-t border-outline-variant/30 px-2">
            <p className="text-xs text-outline font-medium">AnPortafolioIA v{APP_VERSION}</p>
            <p className="text-[10px] text-outline/70 mt-1">GDPR Compliant Build</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--md-sys-color-background)]">
          {/* Header */}
          <div className="hidden md:flex h-16 items-center justify-between px-8 border-b border-outline-variant/20 shrink-0">
            <h3 className="text-lg font-medium text-[var(--md-sys-color-on-background)] capitalize">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close Settings"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant text-outline hover:text-[var(--md-sys-color-on-background)] transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Scrollable Area */}
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar focus:outline-none"
            tabIndex={0}
          >
            <div className="max-w-3xl mx-auto pb-20 md:pb-0">

              {activeTab === 'general' && (
                <div className="space-y-8 animate-fade-in">
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Appearance</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-4 md:p-6 border border-outline-variant/30 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-medium text-[var(--md-sys-color-on-background)]">Theme Mode</p>
                          <p className="text-sm text-outline">Adjust the interface brightness</p>
                        </div>
                        <div className="flex bg-surface-variant rounded-full p-1 self-start md:self-auto" role="radiogroup">
                          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
                            <button
                              key={mode}
                              role="radio"
                              aria-checked={settings.theme === mode}
                              onClick={() => handleThemeChange(mode)}
                              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${settings.theme === mode
                                ? 'bg-[var(--md-sys-color-background)] shadow-sm font-bold text-[var(--md-sys-color-on-background)]'
                                : 'text-outline hover:text-primary'
                                }`}
                            >
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Developer Tools (Design System) */}
                  {onNavigate && (
                    <section>
                      <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Developer Tools</h4>
                      <div className="bg-surface-variant/30 rounded-[20px] p-4 md:p-6 border border-outline-variant/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-medium text-[var(--md-sys-color-on-background)]">Internal Design System</p>
                            <p className="text-sm text-outline">View and test UI components and styles</p>
                          </div>
                          <button
                            onClick={() => {
                              onClose();
                              onNavigate('design-system');
                            }}
                            className="px-4 py-2 rounded-full border border-outline text-primary text-sm font-medium hover:bg-surface-variant transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">palette</span>
                            Open Explorer
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center gap-4 md:gap-6 mb-8">
                    <div
                      className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center text-2xl md:text-3xl font-bold shadow-sm shrink-0 cursor-pointer group overflow-hidden"
                      onClick={handleAvatarClick}
                      title="Click to upload avatar"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />

                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt="Profile"
                          className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`}
                        />
                      ) : (
                        <span className={isUploading ? 'opacity-50' : ''}>
                          {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        {isUploading ? (
                          <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-white">camera_alt</span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-lg md:text-xl font-display font-medium text-[var(--md-sys-color-on-background)] truncate">
                        {isLoading ? 'Loading...' : (profile.fullName || 'User')}
                      </h4>
                      <p className="text-sm text-outline truncate">{profile.email || 'No email'}</p>
                      <button
                        onClick={handleAvatarClick}
                        className="text-xs text-primary hover:underline mt-1 disabled:opacity-50"
                        disabled={isUploading}
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>

                  {/* Public Profile Link */}
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Public Profile</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-4 md:p-6 border border-outline-variant/30">
                      <p className="text-sm text-outline mb-3">Share your profile safely using this public link.</p>

                      {!profile.shareToken ? (
                        <div className="flex flex-col items-start gap-2">
                          <button
                            onClick={handleGenerateToken}
                            disabled={isSaving}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">link</span>
                            )}
                            Generate Public Link
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={`${window.location.origin}/?token=${profile.shareToken}`}
                            className="flex-1 bg-surface-variant rounded-lg px-3 py-2 text-sm font-mono text-on-surface-variant border border-outline-variant/50 focus:outline-none"
                            onClick={(e) => e.currentTarget.select()}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/?token=${profile.shareToken}`);
                            }}
                            className="p-2 hover:bg-primary-container rounded-lg text-primary transition-colors"
                            title="Copy Link"
                          >
                            <span className="material-symbols-outlined text-[20px]">content_copy</span>
                          </button>
                          <a
                            href={`${window.location.origin}/?token=${profile.shareToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-primary-container rounded-lg text-primary transition-colors"
                            title="Open Link"
                          >
                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </section>
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-outline ml-1">First Name</label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => handleProfileChange('firstName', e.target.value)}
                          disabled={isLoading}
                          className="w-full h-12 px-4 rounded-xl bg-surface-variant/30 border border-outline-variant focus:border-primary outline-none text-sm disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-outline ml-1">Last Name</label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => handleProfileChange('lastName', e.target.value)}
                          disabled={isLoading}
                          className="w-full h-12 px-4 rounded-xl bg-surface-variant/30 border border-outline-variant focus:border-primary outline-none text-sm disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6 animate-fade-in">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider">AI Configuration</h4>
                  <div className="bg-surface-variant/30 rounded-[20px] p-4 md:p-6 border border-outline-variant/30 space-y-6">

                    {/* Enable AI */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium text-[var(--md-sys-color-on-background)]">Enable AI Features</p>
                        <p className="text-sm text-outline">Allow AI to analyze and improve your profile</p>
                      </div>
                      <button
                        onClick={() => handleAiChange('enabled', !settings.ai.enabled)}
                        disabled={isLoading}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.ai.enabled
                          ? 'bg-secondary-container'
                          : 'bg-surface-variant border border-outline-variant'
                          }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.ai.enabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Auto Analysis */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium text-[var(--md-sys-color-on-background)]">Auto Analysis</p>
                        <p className="text-sm text-outline">Automatically check for improvements on save</p>
                      </div>
                      <button
                        onClick={() => handleAiChange('autoAnalyze', !settings.ai.autoAnalyze)}
                        disabled={isLoading || !settings.ai.enabled}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.ai.autoAnalyze
                          ? 'bg-secondary-container'
                          : 'bg-surface-variant border border-outline-variant'
                          } ${(!settings.ai.enabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.ai.autoAnalyze ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Creativity Level */}
                    <div>
                      <p className="text-base font-medium text-[var(--md-sys-color-on-background)] mb-3">Creativity Level</p>
                      <div className="flex bg-surface-variant rounded-full p-1 max-w-sm">
                        {(['low', 'medium', 'high'] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => handleAiChange('creativityLevel', level)}
                            disabled={isLoading || !settings.ai.enabled}
                            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${settings.ai.creativityLevel === level
                              ? 'bg-[var(--md-sys-color-background)] shadow-sm font-bold text-[var(--md-sys-color-on-background)]'
                              : 'text-outline hover:text-primary'
                              } ${(!settings.ai.enabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fade-in">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Preferences</h4>
                  <div className="bg-surface-variant/30 rounded-[20px] divide-y divide-outline-variant/20 border border-outline-variant/30">
                    <div className="flex items-center justify-between p-4 md:p-5">
                      <label className="text-sm font-medium text-[var(--md-sys-color-on-background)]">Job Alerts</label>
                      <button
                        onClick={() => handleNotificationToggle('jobAlerts')}
                        disabled={isLoading}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.notifications.jobAlerts
                          ? 'bg-secondary-container'
                          : 'bg-surface-variant border border-outline-variant'
                          }`}
                        aria-label="Toggle Job Alerts"
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.notifications.jobAlerts ? 'right-1' : 'left-1'
                            }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 md:p-5">
                      <label className="text-sm font-medium text-[var(--md-sys-color-on-background)]">Application Updates</label>
                      <button
                        onClick={() => handleNotificationToggle('applicationUpdates')}
                        disabled={isLoading}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.notifications.applicationUpdates
                          ? 'bg-secondary-container'
                          : 'bg-surface-variant border border-outline-variant'
                          }`}
                        aria-label="Toggle Application Updates"
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.notifications.applicationUpdates ? 'right-1' : 'left-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PRIVACY & DATA TAB (GDPR Hub) */}
              {activeTab === 'privacy' && (
                <div className="animate-fade-in space-y-8">

                  {/* Status Banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">lock</span>
                      <div>
                        <h4 className="text-sm font-bold text-primary-onContainer dark:text-blue-200">Secure & Private</h4>
                        <p className="text-xs text-primary-onContainer/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                          Your data is protected with AES-GCM Client-Side Encryption. Only you hold the keys to decrypt your sensitive documents.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cookie Consent Management */}
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Cookie Preferences</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-6 border border-outline-variant/30 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--md-sys-color-on-background)]">Consent Settings</p>
                        <p className="text-xs text-outline mt-1">Manage which cookies and third-party scripts are allowed.</p>
                      </div>
                      <button
                        onClick={openModal}
                        className="px-4 py-2 rounded-full border border-outline text-primary text-sm font-medium hover:bg-surface-variant transition-colors"
                      >
                        Update Preferences
                      </button>
                    </div>
                  </section>

                  {/* Data Rights (DSAR) */}
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Your Data Rights (GDPR)</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-1 border border-outline-variant/30">
                      <StorageSettingsView userKey={userKey} currentContent={{ lastSeen: new Date().toISOString() }} />
                    </div>
                    <p className="text-[10px] text-outline mt-2 px-2">
                      * The "Download Backup" feature satisfies your right to Data Portability (Art. 20 GDPR).
                    </p>
                  </section>

                  {/* Danger Zone */}
                  <section>
                    <h4 className="text-sm font-bold text-error uppercase tracking-wider mb-4">Danger Zone</h4>
                    <div className="bg-error-container/10 rounded-[20px] p-6 border border-error/20 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-error">Delete Account</p>
                        <p className="text-xs text-error/80 mt-1">Permanently remove all your data (Right to Erasure).</p>
                        <p className="text-[10px] text-error/70 mt-2">
                          Your workspace, profile, and settings will be erased and the session will end automatically.
                        </p>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount || isLoading}
                        className="px-5 py-2 rounded-full bg-error text-white text-sm font-semibold hover:bg-error/90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isDeletingAccount ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                            Eliminando...
                          </>
                        ) : (
                          'Delete My Account'
                        )}
                      </button>
                    </div>
                  </section>

                </div>
              )}

            </div>
          </div>

          {/* Footer Actions */}
          {activeTab !== 'privacy' && (
            <div className="p-4 md:p-6 border-t border-outline-variant/20 bg-surface-variant/30 flex justify-end gap-4 shrink-0 safe-pb">
              <button onClick={onClose} className="px-6 py-2 rounded-full text-sm font-medium text-outline hover:bg-surface-variant">Cancel</button>
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isSaving || isLoading}
                className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-elevation-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
