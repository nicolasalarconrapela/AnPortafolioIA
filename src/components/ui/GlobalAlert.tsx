import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Button } from './Button';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string; // If present, shows generic confirm dialog style
    onConfirm?: () => void;
    onCancel?: () => void; // If present, shows cancel button
}

interface AlertContextType {
    showAlert: (message: string, type?: AlertType, options?: AlertOptions) => void;
    showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<AlertType>('info');
    const [options, setOptions] = useState<AlertOptions>({});

    const showAlert = useCallback((msg: string, t: AlertType = 'info', opts: AlertOptions = {}) => {
        setMessage(msg);
        setType(t);
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const showConfirm = useCallback((msg: string, onConfirm: () => void, title: string = 'Confirmar acción') => {
        showAlert(msg, 'warning', {
            title,
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            onConfirm,
            onCancel: () => setIsOpen(false)
        });
    }, [showAlert]);

    const handleClose = () => {
        setIsOpen(false);
        if (options.onCancel) options.onCancel();
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (options.onConfirm) options.onConfirm();
    };

    const icons = {
        success: <CheckCircle2 size={32} className="text-green-500" />,
        error: <ShieldAlert size={32} className="text-red-500" />,
        warning: <AlertTriangle size={32} className="text-yellow-500" />,
        info: <Info size={32} className="text-blue-500" />
    };

    const colors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200'
    };

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-outline-variant/50">
                        <div className={`p-6 flex flex-col items-center text-center ${colors[type]} bg-opacity-30`}>
                            <div className="mb-4 p-3 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                                {icons[type]}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {options.title || (type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : type === 'warning' ? 'Atención' : 'Información')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="p-4 bg-surface dark:bg-surface-dark flex gap-3 justify-center border-t border-outline-variant/30">
                            {options.cancelText && (
                                <Button variant="text" onClick={handleClose}>
                                    {options.cancelText}
                                </Button>
                            )}
                            <Button variant="filled" onClick={handleConfirm} className="min-w-[100px]">
                                {options.confirmText || 'Entendido'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};
