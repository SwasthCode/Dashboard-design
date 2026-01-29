import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateOrder, fetchMyPicks } from "../../store/slices/orderSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import DotLoading from "../../components/common/DotLoading";
import { fetchUsers, fetchRoles } from "../../store/slices/userSlice";
import { ITEMS_PER_PAGE } from "../../constants/constants";

export default function PickerOrders() {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading, updating } = useSelector((state: RootState) => state.order);
    const { users, roles } = useSelector((state: RootState) => state.user);

    const [currentPage, setCurrentPage] = useState(1);
 
    useEffect(() => {
        dispatch(fetchRoles({}));
    }, [dispatch]);

    useEffect(() => {
        if (roles.length > 0) {
            const packerRole = roles.find(r => r.name.toLowerCase() === 'packer');
            if (packerRole) {
                dispatch(fetchUsers({ filter: { role_id: packerRole._id } }));
            }
        }
    }, [roles, dispatch]);

    useEffect(() => {
        dispatch(fetchMyPicks());
        const timer = setInterval(() => {
            dispatch(fetchMyPicks());
        }, 10000);
        return () => clearInterval(timer);
    }, [dispatch]);

    const handleAcceptReject = async (orderId: string, accepted: boolean, remark?: string) => {
        try {
            await dispatch(updateOrder({
                id: orderId,
                data: {
                    picker_accepted: accepted,
                    picker_remark: remark,
                    status: accepted ? "ready" : "hold"
                }
            })).unwrap();
        } catch (err) {
            console.error("Failed to update picker status", err);
        }
    };

    const handleAssignPacker = async (orderId: string, packerId: string) => {
        try {
            await dispatch(updateOrder({
                id: orderId,
                data: { packer_id: packerId }
            })).unwrap();
        } catch (err) {
            console.error("Failed to assign packer", err);
        }
    };

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    const packers = users.filter(u => {
        const packerRole = roles.find(r => r.name.toLowerCase() === 'packer');
        return u.role && u.role.some(r => (typeof r === 'object' ? r._id : r) === packerRole?._id);
    });

    return (
        <div>
            <PageMeta title="Picker Dashboard | Khana Fast" description="Manage your picks" />
            <PageBreadcrumb pageTitle="Picks" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                        Assigned Orders
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Products</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Picker Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Packer Assignment</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-10 text-center"><DotLoading /></td></tr>
                            ) : currentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-brand-500">#{order._id.slice(-8)}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold">{order.customer_name || (order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown')}</div>
                                        <div className="text-xs text-gray-500">{order.shipping_phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            {order.items?.map((item: any, idx: number) => (
                                                <span key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                                    {item.quantity}x {item.name || item.product_name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.picker_accepted === undefined ? (
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-600">New</span>
                                        ) : (
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${order.picker_accepted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {order.picker_accepted ? 'Accepted' : 'Rejected'}
                                            </span>
                                        )}
                                        {order.picker_remark && <div className="text-[10px] text-gray-400 mt-1 italic">"{order.picker_remark}"</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            disabled={!order.picker_accepted}
                                            value={typeof order.packer_id === 'object' ? (order.packer_id as any)?._id : (order.packer_id || "")}
                                            onChange={(e) => handleAssignPacker(order._id, e.target.value)}
                                            className="text-xs border rounded p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        >
                                            <option value="">Assign Packer...</option>
                                            {packers.map(pk => <option key={pk._id} value={pk._id!}>{pk.first_name} {pk.last_name}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleAcceptReject(order._id, true)}
                                                className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded uppercase hover:bg-green-600 disabled:opacity-50"
                                                disabled={updating || order.picker_accepted === true}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const remark = prompt("Enter rejection remark:");
                                                    if (remark) handleAcceptReject(order._id, false, remark);
                                                }}
                                                className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded uppercase hover:bg-red-600 disabled:opacity-50"
                                                disabled={updating || order.picker_accepted === false}
                                            >
                                                Reject
                                            </button>
                                        </div>
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
        </div>
    );
}
