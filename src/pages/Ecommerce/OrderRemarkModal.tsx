import { Modal } from "../../components/ui/modal";

interface OrderRemarkModalProps {
    isOpen: boolean;
    onClose: () => void;
    remark: string;
    orderId?: string;
}

export default function OrderRemarkModal({
    isOpen,
    onClose,
    remark,
    orderId
}: OrderRemarkModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Internal Note
                        </h3>
                        {orderId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Order #{orderId}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 min-h-[100px] max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {remark || "No remark provided."}
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors shadow-sm hover:shadow-brand-500/20"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
