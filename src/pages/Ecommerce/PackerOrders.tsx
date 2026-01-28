import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateOrder, fetchMyPacks, Order } from "../../store/slices/orderSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import DotLoading from "../../components/common/DotLoading";
import { Modal } from "../../components/ui/modal";

export default function PackerOrders() {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading, updating } = useSelector((state: RootState) => state.order);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [selectedOrderForPacking, setSelectedOrderForPacking] = useState<Order | null>(null);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchMyPacks());
        const timer = setInterval(() => {
            dispatch(fetchMyPacks());
        }, 10000);
        return () => clearInterval(timer);
    }, [dispatch]);

    const handlePackComplete = async (status: "ready" | "hold", remark?: string) => {
        if (!selectedOrderForPacking) return;
        try {
            await dispatch(updateOrder({
                id: selectedOrderForPacking._id,
                data: {
                    status: status,
                    packer_remark: remark
                }
            })).unwrap();
            setSelectedOrderForPacking(null);
            setCheckedItems({});
        } catch (err) {
            console.error("Failed to update packer status", err);
        }
    };

    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            <PageMeta title="Packer Dashboard | Khana Fast" description="Manage your packs" />
            <PageBreadcrumb pageTitle="Packs" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">Assigned to Pack</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Picker</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">PACKING</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={4} className="px-4 py-10 text-center"><DotLoading /></td></tr>
                            ) : currentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-brand-500">#{order._id.slice(-8)}</td>
                                    <td className="px-4 py-3 text-sm">{order.customer_name || (order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown')}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {typeof order.picker_id === 'object' && order.picker_id
                                            ? `${order.picker_id.first_name || ''} ${order.picker_id.last_name || ''}`
                                            : <span className="text-gray-400 italic">N/A</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${order.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setSelectedOrderForPacking(order)}
                                            className="px-3 py-1.5 bg-brand-500 text-white text-[10px] font-bold rounded-lg uppercase hover:bg-brand-600"
                                        >
                                            Start Packing
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    startIndex={indexOfFirstItem}
                    endIndex={indexOfLastItem}
                    totalResults={orders.length}
                />
            </div>

            <Modal
                isOpen={!!selectedOrderForPacking}
                onClose={() => setSelectedOrderForPacking(null)}
                className="max-w-[600px] w-full p-6"
            >
                <div className="border-b pb-4 mb-4">
                    <h3 className="text-xl font-bold">Pack Order #{selectedOrderForPacking?._id.slice(-8)}</h3>
                    <p className="text-sm text-gray-500 mt-1">Review all items before marking as packed.</p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {selectedOrderForPacking?.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border">
                                    <img src={item.image || 'https://placehold.co/100'} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{item.name || item.product_name}</div>
                                    <div className="text-xs text-gray-500">Qty: {item.quantity} | {item.brand_name || 'Generic'}</div>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={!!checkedItems[idx]}
                                onChange={(e) => setCheckedItems(prev => ({ ...prev, [idx]: e.target.checked }))}
                                className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            disabled={updating}
                            onClick={() => handlePackComplete("ready")}
                            className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50"
                        >
                            Mark All Packed
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => {
                                const remark = prompt("Why is it not packed? (e.g. Item missing)");
                                if (remark) handlePackComplete("hold", remark);
                            }}
                            className="flex-1 py-3 border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 disabled:opacity-50"
                        >
                            Incomplete / Issues
                        </button>
                    </div>
                    <button
                        onClick={() => setSelectedOrderForPacking(null)}
                        className="py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
}
