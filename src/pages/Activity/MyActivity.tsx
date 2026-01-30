import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPicks, fetchMyPacks } from "../../store/slices/orderSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import DotLoading from "../../components/common/DotLoading";
import { ITEMS_PER_PAGE } from "../../constants/constants";

export default function MyActivity() {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading } = useSelector((state: RootState) => state.order);
    const { user } = useSelector((state: RootState) => state.auth);

    const [currentPage, setCurrentPage] = useState(1);
    const [role, setRole] = useState<"packer" | "picker" | null>(null);

    useEffect(() => {
        if (user && user.role) {
            const userRoles = user.role.map((r: any) => typeof r === 'object' ? r.key?.toLowerCase() : String(r).toLowerCase());
            if (userRoles.includes("packer") || userRoles.includes("3") || userRoles.includes(3)) {
                setRole("packer");
                dispatch(fetchMyPacks());
            } else if (userRoles.includes("picker") || userRoles.includes("4") || userRoles.includes(4)) {
                setRole("picker");
                dispatch(fetchMyPicks());
            }
        }
    }, [user, dispatch]);

    // Polling for updates
    useEffect(() => {
        if (!role) return;

        const timer = setInterval(() => {
            if (role === "packer") dispatch(fetchMyPacks());
            else if (role === "picker") dispatch(fetchMyPicks());
        }, 10000);

        return () => clearInterval(timer);
    }, [dispatch, role]);



    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    if (!role) return <div className="p-10 text-center text-gray-500">Access Denied or Role Not Found</div>;

    return (
        <div>
            <PageMeta title="My Activity | Khana Fast" description="Track your work activity" />
            <PageBreadcrumb pageTitle="My Activity" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                        My {role === "packer" ? "Packed Orders" : "Picked Orders"}
                    </h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 capitalize">
                        Role: {role}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Products</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-10 text-center"><DotLoading /></td></tr>
                            ) : currentOrders.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No activity found.</td></tr>
                            ) : (
                                currentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-brand-500">#{order._id.slice(-8)}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold">{order.customer_name || (order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown')}</div>
                                            <div className="text-xs text-gray-500">{order.shipping_phone}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                                                {order.items?.map((item: any, idx: number) => (
                                                    <span key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                                        {item.quantity}x {item.name || item.product_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full 
                                                ${order.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
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
