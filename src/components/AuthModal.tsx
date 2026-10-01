import React, { useState } from 'react';
import { X, User, Check, ShieldCheck, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateUser: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [googleEmail, setGoogleEmail] = useState('hafsashamim07@gmail.com');
  const [googleName, setGoogleName] = useState('Huzaifa Shamim');
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  if (!isOpen) return null;

  const handleSignInGoogle = () => {
    const newUser: UserAccount = {
      id: `user-google-${Date.now()}`,
      name: googleName || 'Google User',
      email: googleEmail || 'hafsashamim07@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isGuest: false,
      signedInAt: Date.now(),
    };
    onUpdateUser(newUser);
    onClose();
  };

  const handleContinueAsGuest = () => {
    const guestUser: UserAccount = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: undefined,
      avatar: undefined,
      isGuest: true,
      signedInAt: Date.now(),
    };
    onUpdateUser(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1D1A] rounded-3xl shadow-2xl border border-[#DDD8CE] dark:border-[#38352F] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#EAE6DD] dark:border-[#2C2925] flex items-center justify-between bg-[#FAF9F5] dark:bg-[#23211D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D97757] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#1A1917] dark:text-[#EDE8E0]">
                Account & Authentication
              </h2>
              <span className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                Optional Google Sign-In or Guest Access
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A766F] hover:bg-[#EAE6DD] dark:hover:bg-[#2C2A26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Status Badge */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#24221E] border border-[#E5E1D7] dark:border-[#33302B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#ECE8DF] dark:bg-[#34312B] flex items-center justify-center text-[#55524B] dark:text-[#C5C0B5] font-bold text-sm">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-[#1A1917] dark:text-white">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      currentUser.isGuest
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'bg-green-500/15 text-green-700 dark:text-green-300'
                    }`}
                  >
                    {currentUser.isGuest ? 'Guest Mode' : 'Google Verified'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                  {currentUser.email || 'Local offline storage (no cloud login)'}
                </p>
              </div>
            </div>

            {!currentUser.isGuest && (
              <button
                onClick={handleContinueAsGuest}
                className="p-2 rounded-xl text-xs text-[#7A766F] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Switch to Guest"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action: Google Sign In */}
          <div className="space-y-2">
            <button
              onClick={handleSignInGoogle}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#252320] border-2 border-[#DDD8CE] dark:border-[#38352F] hover:border-[#D97757] text-[#1C1A17] dark:text-white font-semibold text-xs flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{currentUser.isGuest ? 'Sign in with Google (Optional)' : 'Update Google Session'}</span>
            </button>

            {/* Custom Google Details Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsEditingCustom(!isEditingCustom)}
                className="text-[11px] text-[#8C877D] hover:text-[#D97757] transition-colors"
              >
                {isEditingCustom ? 'Hide custom Google details' : 'Configure Google email & name'}
              </button>
            </div>

            {isEditingCustom && (
              <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#23211D] border border-[#E5E1D7] dark:border-[#38352F] space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C877D] mb-1">
                    Google Account Name
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DDD8CE] dark:border-[#38352F] bg-white dark:bg-[#1A1917] text-xs outline-none focus:border-[#D97757]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C877D] mb-1">
                    Google Email
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DDD8CE] dark:border-[#38352F] bg-white dark:bg-[#1A1917] text-xs outline-none focus:border-[#D97757]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE6DD] dark:border-[#2C2925]" />
            </div>
            <span className="relative px-3 bg-white dark:bg-[#1E1D1A] text-[10px] uppercase tracking-wider text-[#8A857B]">
              Or continue without account
            </span>
          </div>

          {/* Action: Guest Login */}
          <button
            onClick={handleContinueAsGuest}
            className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              currentUser.isGuest
                ? 'bg-[#FBF5F0] dark:bg-[#342D28] border-[#D97757] text-[#C96442]'
                : 'bg-[#F5F2EA] dark:bg-[#282622] border-transparent text-[#48453F] dark:text-[#C5C0B6] hover:border-[#D97757]/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D97757]" />
              <div className="text-left">
                <div className="font-semibold text-xs">Continue as Guest (Instant Access)</div>
                <div className="text-[10px] text-[#7A766F] dark:text-[#9A968D]">
                  Chat history & memory stored directly on device
                </div>
              </div>
            </div>
            {currentUser.isGuest ? (
              <Check className="w-4 h-4 text-[#D97757]" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#8A857B]" />
            )}
          </button>
        </div>

        {/* Footer Credit */}
        <div className="p-3 bg-[#FAF9F5] dark:bg-[#23211D] border-t border-[#EAE6DD] dark:border-[#2C2925] text-center text-[11px] text-[#7A766F] dark:text-[#9A968D]">
          App created by <strong className="font-semibold text-[#1A1917] dark:text-white">Hafiz Muhammad Huzaifa Shamim</strong>
        </div>
      </div>
    </div>
  );
};
