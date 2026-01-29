import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import Messages from "./pages/Messages";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Users from "./pages/Ecommerce/Users";
import Orders from "./pages/Ecommerce/Orders";
// import CreateOrder from "./pages/Ecommerce/CreateOrder";
// import EditOrder from "./pages/Ecommerce/EditOrder";
import Products from "./pages/Ecommerce/Products";
import AddProduct from "./pages/Ecommerce/AddProduct";
import Categories from "./pages/Ecommerce/Categories";
import AddCategory from "./pages/Ecommerce/AddCategory";
import SubCategories from "./pages/Ecommerce/SubCategories";
import AddSubCategory from "./pages/Ecommerce/AddSubCategory";
import Addresses from "./pages/Ecommerce/Addresses";
import Invoices from "./pages/Ecommerce/Invoices";
import Pay from "./pages/Ecommerce/Pay";
import MainCategories from "./pages/Ecommerce/MainCategories";
import Brands from "./pages/Ecommerce/Brands";
import Reviews from "./pages/Ecommerce/Reviews";
import Coupons from "./pages/Ecommerce/Coupons";
import Analytics from "./pages/Dashboard/Analytics";
import Fintech from "./pages/Dashboard/Fintech";
import Community from "./pages/Community";
import Finance from "./pages/Finance";
import JobBoard from "./pages/JobBoard";
import Tasks from "./pages/Tasks";
import Inbox from "./pages/Inbox";
import Campaigns from "./pages/Campaigns";
import Settings from "./pages/Settings";
import Feed from "./pages/Community/Feed";
import Members from "./pages/Community/Members";
import Transactions from "./pages/Finance/Transactions";
import Cards from "./pages/Finance/Cards";
import JobListing from "./pages/JobBoard/JobListing";
import PostJob from "./pages/JobBoard/PostJob";
import TaskList from "./pages/Tasks/TaskList";
import TaskBoard from "./pages/Tasks/TaskBoard";
import AccountSettings from "./pages/Settings/AccountSettings";
import SecuritySettings from "./pages/Settings/SecuritySettings";
import NotificationSettings from "./pages/Settings/NotificationSettings";
import Changelog from "./pages/Utility/Changelog";
import Support from "./pages/Utility/Support";
import FAQ from "./pages/Utility/FAQ";
import StepOne from "./pages/Onboarding/StepOne";
import StepTwo from "./pages/Onboarding/StepTwo";
import Roles from "./pages/Acl/Roles";

import { useSelector } from 'react-redux';
import CreateOrder from "./pages/Ecommerce/CreateOrder";
import EditOrder from "./pages/Ecommerce/EditOrder";
import PickerOrders from "./pages/Ecommerce/PickerOrders";
import PackerOrders from "./pages/Ecommerce/PackerOrders";
import ViewOrder from "./pages/Ecommerce/ViewOrder";

const RootAuthGuard = () => {
  const token = useSelector((state: any) => state.auth.token) || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  if (token) {
    return (
      <AppLayout>
        <Home />
      </AppLayout>
    );
  }
  return <SignIn />;
};

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Root Route Polymorphism */}
          <Route path="/" element={<RootAuthGuard />} />

          {/* Redirect old dashboard route to root to allow single entry point */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />


          {/* Dashboard Layout - For other protected routes */}
          <Route element={<AppLayout />}>
            {/* <Route path="/dashboard" element={<Home />} />  <-- Removed in favor of RootAuthGuard */}

            {/* E-Commerce */}
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/role/:roleId" element={<Users />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/orders/edit/:id" element={<EditOrder />} />
            <Route path="/orders/view/:id" element={<ViewOrder />} />
            <Route path="/orders/picker" element={<PickerOrders />} />
            <Route path="/orders/packer" element={<PackerOrders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/main-categories" element={<MainCategories />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/categories/add" element={<AddCategory />} />
            <Route path="/sub-categories" element={<SubCategories />} />
            <Route path="/sub-categories/add" element={<AddSubCategory />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/coupons" element={<Coupons />} />

            {/* Remaining Pages */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/fintech" element={<Fintech />} />
            <Route path="/community" element={<Community />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/job-board" element={<JobBoard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/settings" element={<Settings />} />

            {/* Community Sub-pages */}
            <Route path="/community/feed" element={<Feed />} />
            <Route path="/community/profile" element={<UserProfiles />} />
            <Route path="/community/members" element={<Members />} />

            {/* Finance Sub-pages */}
            <Route path="/finance/transactions" element={<Transactions />} />
            <Route path="/finance/cards" element={<Cards />} />

            {/* Job Board Sub-pages */}
            <Route path="/job-board/listing" element={<JobListing />} />
            <Route path="/job-board/post" element={<PostJob />} />

            {/* Tasks Sub-pages */}
            <Route path="/tasks/list" element={<TaskList />} />
            <Route path="/tasks/board" element={<TaskBoard />} />

            {/* ACL - Access Control List */}
            <Route path="/acl/roles" element={<Roles />} />

            {/* Address */}
            <Route path="/customer-addresses" element={<Addresses />} />

            {/* Settings Sub-pages */}
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />

            {/* Utility Sub-pages */}
            <Route path="/utility/changelog" element={<Changelog />} />
            <Route path="/utility/support" element={<Support />} />
            <Route path="/utility/faq" element={<FAQ />} />

            {/* Onboarding */}
            <Route path="/onboarding/step-1" element={<StepOne />} />
            <Route path="/onboarding/step-2" element={<StepTwo />} />

            {/* UI Components */}
            <Route path="/ui/buttons" element={<Buttons />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/messages" element={<Messages />} />
          </Route>

          {/* Auth Layout */}
          {/* <Route path="/" element={<SignIn />} />  <-- Replaced by RootAuthGuard */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
