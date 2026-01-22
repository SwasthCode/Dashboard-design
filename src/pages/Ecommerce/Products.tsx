import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchProducts, deleteProduct, Product } from "../../store/slices/productSlice";
import { fetchCategories, Category } from "../../store/slices/categorySlice";
import { fetchSubCategories, SubCategory } from "../../store/slices/subCategorySlice";
import Pagination from "../../components/common/Pagination";
import AddProductModal from "./AddProductModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EditProductModal from "./EditProductModal";

export default function Products() {
    const dispatch = useDispatch<AppDispatch>();
    const { products, loading } = useSelector((state: RootState) => state.product);
    const { categories } = useSelector((state: RootState) => state.category);
    const { subCategories } = useSelector((state: RootState) => state.subCategory);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const itemsPerPage = 5;

    const toggleRow = (id: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(id)) {
            newExpandedRows.delete(id);
        } else {
            newExpandedRows.add(id);
        }
        setExpandedRows(newExpandedRows);
    };

    useEffect(() => {
        dispatch(fetchProducts());
        if (categories.length === 0) dispatch(fetchCategories());
        if (subCategories.length === 0) dispatch(fetchSubCategories());
    }, [dispatch, categories.length, subCategories.length]);

    // Calculate pagination
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedProduct?._id) {
            setIsDeleting(true);
            try {
                await dispatch(deleteProduct(selectedProduct._id)).unwrap();
                setIsDeleteModalOpen(false);
            } catch (err) {
                console.error("Failed to delete product:", err);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div>
            <PageMeta
                title="Products | TailAdmin - React.js Admin Dashboard"
                description="This is the Products page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Products" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Product List
                    </h3>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                        Add Product
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                                    Variant
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Product Name
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr className="animate-pulse">
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            {/* Dot Loading */}
                                            <div className="flex space-x-1 text-brand-500 text-xl font-bold">
                                                <span className="animate-bounce [animation-delay:0ms]">.</span>
                                                <span className="animate-bounce [animation-delay:150ms]">.</span>
                                                <span className="animate-bounce [animation-delay:300ms]">.</span>
                                            </div>
                                            <span>Loading products...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentProducts.length === 0 ? (
                                <tr className="animate-fadeIn">
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : null}
                            {!loading && currentProducts.map((product: Product, i: number) => (
                                <React.Fragment key={product._id || i}>
                                    <tr
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${expandedRows.has(product._id || '') ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            {product.variants && product.variants.length > 0 && (
                                                <button
                                                    onClick={() => toggleRow(product._id || '')}
                                                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <svg
                                                        className={`w-4 h-4 transition-transform ${expandedRows.has(product._id || '') ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-100">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                {product.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                                {product.category?.name || categories.find((c: Category) => c._id === product.category_id)?.name || ''}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {product.subcategory?.name || subCategories.find((s: SubCategory) => s._id === product.subcategory_id)?.name || ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 dark:text-white">
                                                    &#8377;{product.price}
                                                </span>
                                                {product.mrp > product.price && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        &#8377;{product.mrp}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.stock} {product.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-[10px] font-semibold rounded-full ${product.isAvailable
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {product.isAvailable ? "Available" : "Unavailable"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1.5 text-gray-500 hover:text-brand-500 transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRows.has(product._id || '') && product.variants && product.variants.length > 0 && (
                                        <tr className="bg-gray-50/30 dark:bg-gray-800/10 border-b border-gray-100 dark:border-gray-800">
                                            <td colSpan={8} className="px-6 py-4 animate-fadeIn">
                                                <div className="flex flex-col gap-4 pl-10 pr-6 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Variant Details</span>
                                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                                                    </div>
                                                    <div className="max-w-[85vw] md:max-w-[70vw] lg:max-w-[50vw] xl:max-w-[60vw] overflow-x-auto custom-scrollbar pb-2">
                                                        <div className="flex gap-4">
                                                            {product.variants.map((variant, index) => (
                                                                <div key={index} className="min-w-[300px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{variant.label}</span>
                                                                        <div className="text-right">
                                                                            <div className="text-sm font-bold text-brand-500">₹{variant.price}</div>
                                                                            {variant.originalPrice > variant.price && (
                                                                                <div className="text-xs text-gray-400 line-through">₹{variant.originalPrice}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                            <div>
                                                                                <span className="text-gray-500 dark:text-gray-400">Shelf Life:</span>
                                                                                <span className="ml-1 text-gray-700 dark:text-gray-200 font-medium">{variant.shelfLife || "N/A"}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500 dark:text-gray-400">Expiry:</span>
                                                                                <span className="ml-1 text-gray-700 dark:text-gray-200 font-medium">{variant.expiryDate || "N/A"}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-xs">
                                                                            <span className="text-gray-500 dark:text-gray-400 block">Manufacturer:</span>
                                                                            <span className="text-gray-700 dark:text-gray-200 font-medium truncate block" title={variant.manufacturerName}>
                                                                                {variant.manufacturerName || "N/A"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    startIndex={indexOfFirstItem}
                    endIndex={indexOfLastItem}
                    totalResults={products.length}
                />
            </div>
            <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={selectedProduct}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </div>
    );
}
