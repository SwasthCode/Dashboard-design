import { useSelector } from "react-redux";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { RootState } from "../../store";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

export default function AccountSettings() {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <div>
            <PageMeta
                title="Account Settings | TailAdmin - React.js Admin Dashboard"
                description="This is the Account Settings page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Account Settings" />

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9">
                    {/* User Profile Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-default dark:border-gray-800 dark:bg-gray-900">
                        <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-medium text-black dark:text-white">
                                ID Card
                            </h3>
                            <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${user?.is_active ? 'bg-success text-success' : 'bg-danger text-danger'}`}>
                                {user?.status || (user?.is_active ? "Active" : "Inactive")}
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-brand-500 text-4xl font-bold dark:bg-gray-800 mb-4 border-4 border-white shadow-md dark:border-gray-700">
                                    {user?.first_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <h4 className="font-bold text-xl text-black dark:text-white mb-1">
                                    {user?.first_name} {user?.last_name}
                                </h4>
                                <p className="text-sm font-medium text-gray-500 mb-6">{user?.role?.[0]?.name || "User"}</p>

                                <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">Joined</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                                            {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-9">
                    {/* Personal Info Form */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-default dark:border-gray-800 dark:bg-gray-900">
                        <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-800">
                            <h3 className="font-medium text-black dark:text-white">
                                Personal Information
                            </h3>
                        </div>
                        <div className="p-6">
                            <form action="#">
                                <div className="mb-4">
                                    <Label>First Name</Label>
                                    <Input
                                        type="text"
                                        placeholder="First Name"
                                        defaultValue={user?.first_name || ""}
                                        readOnly
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                                    />
                                </div>

                                <div className="mb-4">
                                    <Label>Last Name</Label>
                                    <Input
                                        type="text"
                                        placeholder="Last Name"
                                        defaultValue={user?.last_name || ""}
                                        readOnly
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                                    />
                                </div>

                                <div className="mb-4">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        defaultValue={user?.email || ""}
                                        readOnly
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                                    />
                                </div>

                                <div className="mb-4">
                                    <Label>Username</Label>
                                    <Input
                                        type="text"
                                        placeholder="Username"
                                        defaultValue={user?.username || ""}
                                        readOnly
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                                    />
                                </div>

                                <div className="mb-4">
                                    <Label>Phone Number</Label>
                                    <Input
                                        type="text"
                                        placeholder="Phone Number"
                                        defaultValue={user?.phone_number || ""}
                                        readOnly
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
