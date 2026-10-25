import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export type AppAlertType = 'error' | 'warning' | 'info' | 'success';

export interface AppAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: AppAlertType;
    confirmText?: string;
}

export default function AppAlertDialog({
    isOpen,
    onClose,
    title,
    message,
    type = 'error',
    confirmText = 'Got it',
}: AppAlertModalProps) {
    const config = {
        error: {
            icon: AlertCircle,
            iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
            buttonClass: 'bg-rose-500 hover:bg-rose-600 text-white',
            defaultTitle: 'Something went wrong',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
            buttonClass: 'bg-amber-500 hover:bg-amber-600 text-black font-semibold',
            defaultTitle: 'Notice',
        },
        info: {
            icon: Info,
            iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
            buttonClass: 'bg-white hover:bg-zinc-200 text-black font-semibold',
            defaultTitle: 'Information',
        },
        success: {
            icon: CheckCircle2,
            iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
            buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold',
            defaultTitle: 'Success',
        },
    }[type];

    const Icon = config.icon;

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-md w-[92vw] bg-[#0c0d0f] text-white border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl z-[100]">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${config.iconBg} shadow-lg shrink-0`}>
                        <Icon className="h-7 w-7" />
                    </div>

                    <AlertDialogHeader className="space-y-1.5 text-center">
                        <AlertDialogTitle className="text-xl font-bold tracking-tight text-white">
                            {title || config.defaultTitle}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-zinc-400 leading-relaxed font-normal">
                            {message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="w-full sm:justify-center pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`w-full py-3 px-6 rounded-full text-sm font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md ${config.buttonClass}`}
                        >
                            {confirmText}
                        </button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
