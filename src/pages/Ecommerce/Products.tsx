import React, { useState, useEffect, useCallback, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchProducts, deleteProduct, addProduct, Product } from "../../store/slices/productSlice";
import { fetchCategories, Category } from "../../store/slices/categorySlice";
import { fetchSubCategories, SubCategory } from "../../store/slices/subCategorySlice";
import { fetchBrands } from "../../store/slices/brandSlice";
import { fetchMainCategories } from "../../store/slices/mainCategorySlice";
import Pagination from "../../components/common/Pagination";
import AddProductModal from "./AddProductModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EditProductModal from "./EditProductModal";
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";
import { ITEMS_PER_PAGE, MIN_TABLE_HEIGHT, PRODUCT_PRICE_RANGES, PRODUCT_UNITS } from "../../constants/constants";
import Checkbox from "../../components/form/input/Checkbox";


const TypeStockFilter = ({
    selectedType,
    selectedStock,
    selectedUnits,
    selectedPriceRange,
    minPrice,
    maxPrice,
    onTypeChange,
    onStockChange,
    onUnitChange,
    onPriceRangeChange,
    onMinPriceChange,
    onMaxPriceChange
}: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getLabel = () => {
        const parts = [];
        if (selectedType) parts.push(selectedType === "variant" ? "Variant" : "Non-Variant");
        if (selectedStock) parts.push(selectedStock === "in_stock" ? "In Stock" : "Out of Stock");
        if (selectedPriceRange) {
            if (selectedPriceRange === "custom") {
                if (minPrice || maxPrice) parts.push(`₹${minPrice || 0}-${maxPrice || '∞'}`);
                else parts.push("Custom Price");
            } else {
                const range = PRODUCT_PRICE_RANGES.find(r => r.value === selectedPriceRange);
                if (range) parts.push(range.label);
            }
        }
        if (selectedUnits && selectedUnits.length > 0) {
            if (selectedUnits.length === 1) {
                const unit = PRODUCT_UNITS.find(u => u.value === selectedUnits[0]);
                if (unit) parts.push(unit.label);
            } else {
                parts.push(`${selectedUnits.length} Units`);
            }
        }
        return parts.length > 0 ? parts.join(" & ") : "Filters";
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onTypeChange("");
        onStockChange("");
        onUnitChange([]);
        onPriceRangeChange("");
        onMinPriceChange("");
        onMaxPriceChange("");
    };

    return (
        <div className="relative w-full sm:w-44" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs transition-all hover:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${isOpen ? 'border-brand-500 ring-3 ring-brand-500/10' : ''}`}
            >
                <span className={`truncate ${(selectedType || selectedStock || (selectedUnits && selectedUnits.length > 0) || selectedPriceRange || minPrice || maxPrice) ? 'text-gray-800 dark:text-white font-medium' : 'text-gray-400'}`}>
                    {getLabel()}
                </span>
                <div className="flex items-center">
                    {(selectedType || selectedStock || (selectedUnits && selectedUnits.length > 0) || selectedPriceRange || minPrice || maxPrice) && (
                        <div
                            onClick={handleClearAll}
                            className="mr-1.5 p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                            title="Clear All"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                    <svg className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[28vw] rounded-xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 animate-fadeIn">
                    <div className="space-y-4">
                        <div className="flex gap-8">
                            <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Product Type</p>
                                <div className="space-y-2">
                                    <Checkbox
                                        label="Variant"
                                        checked={selectedType === "variant"}
                                        onChange={() => onTypeChange(selectedType === "variant" ? "" : "variant")}
                                    />
                                    <Checkbox
                                        label="Non-Variant"
                                        checked={selectedType === "non_variant"}
                                        onChange={() => onTypeChange(selectedType === "non_variant" ? "" : "non_variant")}
                                    />
                                </div>
                            </div>
                            <div className="border-l border-gray-100 pl-8 dark:border-gray-800">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock Status</p>
                                <div className="space-y-2">
                                    <Checkbox
                                        label="In Stock"
                                        checked={selectedStock === "in_stock"}
                                        onChange={() => onStockChange(selectedStock === "in_stock" ? "" : "in_stock")}
                                    />
                                    <Checkbox
                                        label="Out of Stock"
                                        checked={selectedStock === "out_of_stock"}
                                        onChange={() => onStockChange(selectedStock === "out_of_stock" ? "" : "out_of_stock")}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Price Range</p>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
                                {PRODUCT_PRICE_RANGES.map((range) => (
                                    <Checkbox
                                        key={range.value}
                                        label={range.label}
                                        checked={selectedPriceRange === range.value}
                                        onChange={() => {
                                            const newValue = selectedPriceRange === range.value ? "" : range.value;
                                            onPriceRangeChange(newValue);
                                            if (newValue !== "custom") {
                                                onMinPriceChange("");
                                                onMaxPriceChange("");
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            {selectedPriceRange === "custom" && (
                                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-fadeIn">
                                    <input
                                        type="number"
                                        placeholder="Min ₹"
                                        value={minPrice}
                                        onChange={(e) => onMinPriceChange(e.target.value)}
                                        className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs outline-none focus:border-brand-500 transition-all shadow-sm"
                                    />
                                    <span className="text-gray-400 text-xs">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max ₹"
                                        value={maxPrice}
                                        onChange={(e) => onMaxPriceChange(e.target.value)}
                                        className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs outline-none focus:border-brand-500 transition-all shadow-sm"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Unit Type</p>
                            <div className="grid grid-cols-4 gap-y-3 gap-x-2">
                                {PRODUCT_UNITS.map((unit) => (
                                    <Checkbox
                                        key={unit.value}
                                        label={unit.label}
                                        checked={selectedUnits.includes(unit.value)}
                                        onChange={() => {
                                            const newUnits = selectedUnits.includes(unit.value)
                                                ? selectedUnits.filter((u: string) => u !== unit.value)
                                                : [...selectedUnits, unit.value];
                                            onUnitChange(newUnits);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function Products() {
    const dispatch = useDispatch<AppDispatch>();
    const { products, loading } = useSelector((state: RootState) => state.product);
    const { categories } = useSelector((state: RootState) => state.category);
    const { subCategories } = useSelector((state: RootState) => state.subCategory);
    const { brands } = useSelector((state: RootState) => state.brand);
    const { mainCategories } = useSelector((state: RootState) => state.mainCategory);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedStock, setSelectedStock] = useState("");
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

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
        dispatch(fetchProducts({}));
        if (categories.length === 0) dispatch(fetchCategories());
        if (subCategories.length === 0) dispatch(fetchSubCategories());
        if (brands.length === 0) dispatch(fetchBrands({}));
        if (mainCategories.length === 0) dispatch(fetchMainCategories({}));
    }, [dispatch, categories.length, subCategories.length, brands.length, mainCategories.length]);

    // Construct filter for backend
    const buildFilter = useCallback(() => {
        const filter: any = {};

        if (searchQuery) {
            filter.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
            ];
        }

        if (selectedStatus) {
            filter.isAvailable = selectedStatus === "available";
        }

        if (selectedType) {
            filter.variants = selectedType === "variant" ? { $exists: true, $not: { $size: 0 } } : { $size: 0 };
        }

        if (selectedStock) {
            if (selectedStock === "in_stock") filter.stock = { $gt: 0 };
            if (selectedStock === "out_of_stock") filter.stock = 0;
        }

        if (selectedUnits && selectedUnits.length > 0) {
            filter.unit = { $regex: `^(${selectedUnits.join('|')})$`, $options: 'i' };
        }

        // Price range logic
        if (selectedPriceRange || (selectedPriceRange === "custom" && (minPrice || maxPrice))) {
            filter.price = {};
            if (selectedPriceRange && selectedPriceRange !== "custom") {
                const [min, max] = selectedPriceRange.split("-");
                if (min) filter.price.$gte = Number(min);
                if (max) filter.price.$lte = Number(max);
            } else if (selectedPriceRange === "custom") {
                if (minPrice) filter.price.$gte = Number(minPrice);
                if (maxPrice) filter.price.$lte = Number(maxPrice);
            }
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }
        return filter;
    }, [searchQuery, selectedStatus, selectedType, selectedStock, selectedUnits, selectedPriceRange, minPrice, maxPrice, startDate, endDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const filter = buildFilter();
            dispatch(fetchProducts({ filter }));
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, buildFilter, categories.length, subCategories.length]);

    const handleFilterChange = ({ search, startDate: start, endDate: end, status, type, stock, priceRange }: any) => {
        setSearchQuery(search);
        setStartDate(start);
        setEndDate(end);
        setSelectedStatus(status || "");
        setSelectedType(type || "");
        setSelectedStock(stock || "");
        setSelectedPriceRange(priceRange || "");
        // Reset custom prices if not in custom mode
        if (priceRange !== "custom") {
            setMinPrice("");
            setMaxPrice("");
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
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

    const handleClone = async (product: Product) => {
        try {
            // Create a copy of the product and modify it for uniqueness
            const { _id, createdAt, updatedAt, __v, images, category, subcategory, brand, ...rest } = product;

            const clonedProduct = {
                ...rest,
                name: `${product.name} (Copy)`,
                // Send simplified images (URLs only) - the backend should handle this if it accepts existing URLs
                images: images?.map(img => ({ url: img.url })),
                // Ensure IDs are passed for category/subcategory/brand if they were objects
                category_id: product.category_id || category?._id,
                subcategory_id: product.subcategory_id || subcategory?._id,
                brand_id: product.brand_id || brand?._id,
                // Clear variant IDs
                variants: product.variants?.map(({ _id, ...v }) => v)
            };

            await dispatch(addProduct(clonedProduct as any)).unwrap();
            // Refresh is handled by the useEffect watching products/categories/etc but
            // usually addProduct fulfilled reducer adds it to the state.
            // If the backend doesn't trigger a re-fetch, we might want to manually re-fetch:
            dispatch(fetchProducts({ filter: buildFilter() }));
        } catch (err) {
            console.error("Failed to clone product:", err);
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
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white  tracking-wide">
                        Product List
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
                        <div className="w-full sm:w-auto">
                            <TableFilter
                                placeholder="Search Products..."
                                onFilterChange={handleFilterChange}
                                className="mb-0"
                                filters={[
                                    {
                                        key: "status",
                                        label: "Status",
                                        options: [
                                            { label: "Available", value: "available" },
                                            { label: "Unavailable", value: "unavailable" },
                                        ]
                                    },
                                ]}
                            >
                                <TypeStockFilter
                                    selectedType={selectedType}
                                    selectedStock={selectedStock}
                                    selectedUnits={selectedUnits}
                                    selectedPriceRange={selectedPriceRange}
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    onTypeChange={setSelectedType}
                                    onStockChange={setSelectedStock}
                                    onUnitChange={setSelectedUnits}
                                    onPriceRangeChange={setSelectedPriceRange}
                                    onMinPriceChange={setMinPrice}
                                    onMaxPriceChange={setMaxPrice}
                                />
                            </TableFilter>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20 whitespace-nowrap flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Product
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto ${MIN_TABLE_HEIGHT}`}>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-10">
                                    S.no
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-10">
                                    Variant
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Product Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr className="animate-pulse">
                                    <td colSpan={11} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <DotLoading />
                                            <span>Loading products...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentProducts.length === 0 ? (
                                <tr className="animate-fadeIn">
                                    <td colSpan={11} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No products found</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                            {!loading && currentProducts.map((product: Product, i: number) => (
                                <React.Fragment key={product._id || i}>
                                    <tr
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${expandedRows.has(product._id || '') ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''} ${product.stock === 0 ? 'bg-red-400/10 dark:bg-red-400/30' : ''}`}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            {product.variants && product.variants.length > 0 && (
                                                <button
                                                    onClick={() => toggleRow(product._id || '')}
                                                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
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
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                                {product.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {product.category?.name || categories.find((c: Category) => c._id === product.category_id)?.name || ''}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {product.subcategory?.name || subCategories.find((s: SubCategory) => s._id === product.subcategory_id)?.name || ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {product.brand?.name || brands.find((b: any) => b._id === product.brand_id)?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
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
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {product.stock} {product.unit}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border border-transparent ${product.isAvailable
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {product.isAvailable ? "Available" : "Unavailable"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1.5 text-gray-500 hover:text-brand-500 bg-white border border-gray-200 rounded-lg hover:border-brand-200 transition-all shadow-sm"
                                                    title="Edit"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleClone(product)}
                                                    className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"
                                                    title="Clone"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-lg hover:border-red-200 transition-all shadow-sm"
                                                    title="Delete"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRows.has(product._id || '') && product.variants && product.variants.length > 0 && (
                                        <tr className="bg-gray-50/30 dark:bg-gray-800/10 border-b border-gray-100 dark:border-gray-800">
                                            <td colSpan={11} className="px-4 py-4 animate-fadeIn">
                                                <div className="flex flex-col gap-4 pl-8 pr-4 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Variant Details</span>
                                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                                                    </div>
                                                    {/* ... Variant content ... */}
                                                    <div className="w-full max-w-[75vw] overflow-x-auto custom-scrollbar pb-2">
                                                        <div className="flex gap-4">
                                                            {product.variants.map((variant, index) => (
                                                                <div key={index} className="min-w-[300px] bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{variant.label}</span>
                                                                        <div className="text-right">
                                                                            <div className="text-sm font-bold text-brand-500">₹{variant.price}</div>
                                                                            {variant.originalPrice > variant.price && (
                                                                                <div className="text-xs text-gray-400 line-through">₹{variant.originalPrice}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {/* ... Variant details ... */}
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
                                                                        <div className="text-xs space-y-1">
                                                                            <div>
                                                                                <span className="text-gray-500 dark:text-gray-400">Manufacturer:</span>
                                                                                <span className="ml-1 text-gray-700 dark:text-gray-200 font-medium">{variant.manufacturer || variant.manufacturerName || "N/A"}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500 dark:text-gray-400">Address:</span>
                                                                                <span className="ml-1 text-gray-700 dark:text-gray-200 font-medium truncate inline-block max-w-full align-bottom" title={variant.manufacturerAddress}>
                                                                                    {variant.manufacturerAddress || "N/A"}
                                                                                </span>
                                                                            </div>
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
        </div >
    );
}
