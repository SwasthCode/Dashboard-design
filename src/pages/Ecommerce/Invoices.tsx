import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, Invoice as InvoiceType } from "../../store/slices/invoiceSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";
import { EyeIcon, TrashBinIcon } from "../../icons";
import { Order } from "../../store/slices/orderSlice";

interface Invoice {
    id: string;
    client: string;
    email: string;
    phone_number: string;
    amount: string;
    paymentMode: string;
    date: string;
    dueDate: string;
    status: "Paid" | "Unpaid" | "Overdue";
    orderStatus?: string;
    updatedAt?: string;
    originalOrder?: Order; // We might need to fetch this or keep it empty for now if not fully populated
    // Ideally the invoice from backend should contain enough info for printing
    printData?: any;
}

export default function Invoices() {
    const dispatch = useDispatch<AppDispatch>();
    const { invoices: backendInvoices, loading } = useSelector((state: RootState) => state.invoice);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        dispatch(fetchInvoices({}));
    }, [dispatch]);

    const invoices: Invoice[] = backendInvoices.map((inv: InvoiceType) => ({
        id: (inv.invoice_number || inv._id).slice(-8).toUpperCase(),
        client: `${inv.user_id?.first_name} ${inv.user_id?.last_name}`,
        email: inv.user_id?.email || "Not available",
        phone_number: inv.user_id?.phone_number || inv.billing_address?.shipping_phone || "Not available",
        amount: `$${inv.total_amount.toLocaleString()}`,
        paymentMode: inv.payment_method || "Not available",
        date: new Date(inv.issued_at || inv.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }) : "N/A",
        status: inv.status === "paid" ? "Paid" : inv.status === "pending" ? "Unpaid" : "Unpaid", // Map backend status
        orderStatus: typeof inv.order_id === 'object' ? inv.order_id.status : undefined,
        updatedAt: inv.updatedAt,
        printData: inv, // Passing the whole invoice object for printing
    }));

    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        setFilteredInvoices(invoices);
    }, [backendInvoices]);

    const handleFilterChange = ({ search, startDate, endDate }: any) => {
        let result = invoices;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(inv =>
                inv.client.toLowerCase().includes(lowerSearch) ||
                inv.id.toLowerCase().includes(lowerSearch) ||
                inv.email.toLowerCase().includes(lowerSearch)
            );
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            result = result.filter(inv => {
                if (!inv.updatedAt) return true;
                const date = new Date(inv.updatedAt);
                return date >= start && date <= end;
            });
        }

        setFilteredInvoices(result);
        setCurrentPage(1);
    };

    const printInvoice = (invoiceData: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(invoiceData.issued_at || invoiceData.createdAt).toLocaleDateString();
        const customerName = invoiceData.user_id ? `${invoiceData.user_id.first_name} ${invoiceData.user_id.last_name}` : 'Not available';
        const address = invoiceData.billing_address ? `${invoiceData.billing_address.address}, ${invoiceData.billing_address.city}, ${invoiceData.billing_address.state} - ${invoiceData.billing_address.pincode}` : 'Not available';
        const phone = invoiceData.user_id?.phone_number || invoiceData.billing_address?.shipping_phone || 'Not available';

        const itemsHtml = invoiceData.items?.map((item: any) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0; font-size: 14px; color: #1f2937;">${item.name || item.product_name}</td>
                <td style="padding: 12px 0; text-align: center; font-size: 14px; color: #1f2937;">${item.quantity}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #1f2937;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">₹${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('') || '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${(invoiceData.invoice_number || invoiceData._id).slice(-8).toUpperCase()} | Khana Fast</title>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Outfit', sans-serif; padding: 40px; color: #4b5563; line-height: 1.5; }
                        .container { max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
                        .brand { display: flex; flex-direction: column; }
                        .logo-text { font-size: 28px; font-weight: 800; color: #f97316; letter-spacing: -0.5px; }
                        .logo-subtext { font-size: 12px; color: #059669; font-weight: 600; text-transform: uppercase; margin-top: -4px; }
                        .invoice-label { font-size: 40px; font-weight: 200; color: #9ca3af; text-align: right; }
                        
                        .info-section { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #f3f4f6; }
                        .section-title { font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.1em; }
                        .text-bold { font-weight: 600; color: #111827; margin-bottom: 4px; }
                        .text-small { font-size: 14px; color: #6b7280; }

                        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        th { text-align: left; padding-bottom: 12px; border-bottom: 2px solid #111827; font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.05em; }
                        
                        .footer { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; }
                        .notes-section { font-size: 13px; color: #9ca3af; }
                        .totals-grid { display: flex; flex-direction: column; gap: 12px; }
                        .total-row { display: flex; justify-content: space-between; font-size: 14px; }
                        .grand-total { border-top: 1px solid #f3f4f6; padding-top: 12px; margin-top: 4px; font-size: 20px; font-weight: 700; color: #111827; }
                        
                        @media print {
                            body { padding: 20px; }
                            .container { width: 100%; }
                            -webkit-print-color-adjust: exact;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand">
                                <div class="logo-text">KHANA FAST</div>
                                <div class="logo-subtext">Quick • Fresh • Reliable</div>
                            </div>
                            <div class="invoice-label">INVOICE</div>
                        </div>
                        
                        <div class="info-section">
                            <div>
                                <div class="section-title">Billed To</div>
                                <div class="text-bold">${customerName}</div>
                                <div class="text-small">${address}</div>
                                <div class="text-small">Phone: ${phone}</div>
                            </div>
                            <div>
                                <div class="section-title">Invoice Details</div>
                                <div class="text-small"><span class="text-bold">Invoice ID:</span> #${(invoiceData.invoice_number || invoiceData._id).slice(-8).toUpperCase()}</div>
                                <div class="text-small"><span class="text-bold">Date:</span> ${date}</div>
                                <div class="text-small"><span class="text-bold">Status:</span> ${invoiceData.status.toUpperCase()}</div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Service/Product</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Rate</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div class="footer">
                            <div class="notes-section">
                                <div class="section-title">Important Note</div>
                                <p>Thank you for choosing Khana Fast. If you have any questions about this invoice, please reach out to our support team.</p>
                                <p style="margin-top: 20px;">© 2026 Khana Fast. All rights reserved.</p>
                            </div>
                            <div class="totals-grid">
                                <div class="total-row">
                                    <div style="color: #9ca3af;">Subtotal</div>
                                    <div class="text-bold">₹${invoiceData.total_amount.toLocaleString()}</div>
                                </div>
                                <div class="total-row">
                                    <div style="color: #9ca3af;">Delivery Fee</div>
                                    <div class="text-bold">₹0</div>
                                </div>
                                <div class="total-row grand-total">
                                    <div>Total</div>
                                    <div>₹${invoiceData.total_amount.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageMeta
                title="Invoices | TailAdmin - React.js Admin Dashboard"
                description="This is the Invoices page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Invoices" />

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                        <TableFilter
                            placeholder="Search Invoices..."
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Invoice List
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Invoice ID
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Amount
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Payment Mode
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Issued Date
                                </th>
                                {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Due Date
                                </th> */}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Invoice Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Order Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Updated At
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr className="animate-pulse">
                                    <td colSpan={10} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <DotLoading />
                                            <span>Loading invoices...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentInvoices.map((invoice, i) => (
                                    <tr
                                        key={i}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-brand-500 underline cursor-pointer">
                                                {invoice.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                    {invoice.client || "Not available"}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {invoice.email || "Not available"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {invoice.phone_number || "Not available"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                {invoice.amount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {invoice.paymentMode || "Not available"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {invoice.date || "Not available"}
                                            </span>
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {invoice.dueDate || "Not available"}
                                            </span>
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === "Paid"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                                    : invoice.status === "Unpaid"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                                        : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                                    }`}
                                            >
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {invoice.orderStatus ? (
                                                <span
                                                    className={`px-2 py-1 text-[10px] font-semibold rounded-full ${
                                                        invoice.orderStatus.toLowerCase() === "pending" ? "bg-orange-100 text-orange-600" :
                                                        invoice.orderStatus.toLowerCase() === "ready" ? "bg-blue-100 text-blue-600" :
                                                        invoice.orderStatus.toLowerCase() === "shipped" ? "bg-purple-100 text-purple-600" :
                                                        invoice.orderStatus.toLowerCase() === "delivered" ? "bg-green-100 text-green-600" :
                                                        invoice.orderStatus.toLowerCase() === "cancelled" ? "bg-red-100 text-red-600" :
                                                        "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {invoice.orderStatus.charAt(0).toUpperCase() + invoice.orderStatus.slice(1)}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400 font-medium">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.updatedAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                            <div className="flex justify-end gap-2">
                                                {invoice.printData && (
                                                    <button
                                                        onClick={() => printInvoice(invoice.printData)}
                                                        className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                                        title="View/Print Invoice"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashBinIcon className="w-5 h-5" />
                                                </button>
                                            </div>
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
                    onPageChange={handlePageChange}
                    startIndex={indexOfFirstItem}
                    endIndex={indexOfLastItem}
                    totalResults={filteredInvoices.length}
                />
            </div>
        </div>
    );
}
