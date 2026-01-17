import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useDispatch, useSelector } from "react-redux";
import { addSubCategory, SubCategory } from "../../store/slices/subCategorySlice";
import { RootState } from "../../store";
import { useNavigate } from "react-router";

export default function AddSubCategory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categories } = useSelector((state: RootState) => state.category);

    const [formData, setFormData] = useState({
        name: "",
        parent: "",
        description: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newSubCategory: SubCategory = {
            name: formData.name,
            parent: formData.parent,
            description: formData.description,
            products: 0, // Initial count
        };

        dispatch(addSubCategory(newSubCategory));
        navigate("/sub-categories");
    };

    return (
        <div>
            <PageMeta
                title="Add Sub-Category | TailAdmin - React.js Admin Dashboard"
                description="Add a new sub-category to your store"
            />
            <PageBreadcrumb pageTitle="Add Sub-Category" />

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9">
                    {/* Contact Form */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Sub-Category Details
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6.5">
                                <div className="mb-4.5">
                                    <Label htmlFor="name">Sub-Category Name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        placeholder="Enter sub-category name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-4.5">
                                    <Label htmlFor="parent">Parent Category</Label>
                                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                                        <select
                                            id="parent"
                                            value={formData.parent}
                                            onChange={handleInputChange}
                                            required
                                            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                                        >
                                            <option value="">Select Parent Category</option>
                                            {categories.map((category, index) => (
                                                <option key={index} value={category.name}>{category.name}</option>
                                            ))}
                                        </select>
                                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                            <svg
                                                className="fill-current"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill=""
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        rows={6}
                                        id="description"
                                        placeholder="Type sub-category description"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <button type="submit" className="flex w-full justify-center rounded bg-brand-500 p-3 font-medium text-gray hover:bg-opacity-90 text-white">
                                    Add Sub-Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
