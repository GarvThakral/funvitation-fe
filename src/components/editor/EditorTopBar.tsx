import { Check, Copy, LogOut, Share2 } from 'lucide-react';

interface EditorTopBarProps {
  shareUrl: string | null;
  copied: boolean;
  onCopy: () => void;
  onSignOut: () => void;
  userEmail?: string;
  currentPlanLabel?: string;
  usageLabel?: string;
  onManageBilling: () => void;
  onUpgrade: () => void;
  hasCustomerPortal: boolean;
  billingBusy: boolean;
}

export default function EditorTopBar({
  shareUrl,
  copied,
  onCopy,
  onSignOut,
  userEmail,
  currentPlanLabel,
  usageLabel,
  onManageBilling,
  onUpgrade,
  hasCustomerPortal,
  billingBusy,
}: EditorTopBarProps) {
  return (
    <div className="h-16 bg-white/80 backdrop-blur-md border-b border-[#f3c583]/60 flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-[#e99497] to-[#f3c583] rounded-lg flex items-center justify-center shadow-sm">
          <Share2 size={16} className="text-[#2f2c28]" />
        </div>
        <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c86d75] to-[#d3872e] text-lg tracking-tight">
          funvitation
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {currentPlanLabel && (
          <div className="hidden items-center gap-2 rounded-full border border-[#f3c583]/60 bg-[#fffaf0] px-3 py-2 md:flex">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c86d75]">
              {currentPlanLabel}
            </span>
            {usageLabel && <span className="text-[10px] text-[#6a645a]">{usageLabel}</span>}
          </div>
        )}

        {shareUrl && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs text-[#c86d75] font-semibold">Shareable link ready!</span>
            <div className="flex items-center gap-2 bg-[#fff4dd] p-1 pl-3 rounded-full border border-[#f3c583]/60">
              <span className="text-[10px] text-[#c86d75] truncate max-w-[200px] font-medium">{shareUrl}</span>
              <button
                onClick={onCopy}
                className="bg-white p-1.5 rounded-full shadow-sm hover:bg-[#fff0f0] transition-all flex items-center gap-1.5 px-3"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-[#6fa44a]" />
                    <span className="text-[10px] font-bold text-[#6fa44a]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-[#c86d75]" />
                    <span className="text-[10px] font-bold text-[#c86d75]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={hasCustomerPortal ? onManageBilling : onUpgrade}
          disabled={billingBusy}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e99497]/60 bg-white px-3 py-2 text-xs font-semibold text-[#c86d75] hover:bg-[#fff0f0] disabled:opacity-60"
        >
          {billingBusy ? 'Please wait...' : hasCustomerPortal ? 'Manage Billing' : 'Upgrade'}
        </button>

        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-2 rounded-lg border border-[#b3e283] bg-[#f7ffe9] px-3 py-2 text-xs font-semibold text-[#3f6630] hover:bg-[#edffd2]"
        >
          <span className="hidden md:inline max-w-40 truncate">{userEmail || 'Account'}</span>
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
