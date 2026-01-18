import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentProducts from "../../components/ecommerce/RecentProducts";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import DemographicCard from "../../components/ecommerce/DemographicCard";
// import FilterDropdown from "../../components/header/FilterDropdown";
// import DateRangePicker from "../../components/header/DateRangePicker";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (status == "loading") {
    // You can implement a skeletal loader here
    return <div className="flex items-center justify-center h-screen">
      <div>Loading dashboard...</div>
    </div>;
  }

  return (
    <>
      <PageMeta
        title="Dashboard"
        description="Dashboard Overview"
      />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Dashboard
        </h2>

        {/* <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown />
          <DateRangePicker />

          <button className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-theme-xs hover:bg-gray-800 dark:bg-brand-500 dark:hover:bg-brand-600">
            Add View
          </button>
        </div> */}
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            totalOrders={data?.orders?.grand_total_orders || 0}
            totalUsers={data?.users?.grand_total_users || 0}
          />

          <MonthlySalesChart
            orders={data?.orders?.monthly_counts || []}
            users={data?.users?.monthly_counts || []}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        {/* <div className="col-span-12">
          <StatisticsChart />
        </div> */}

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentProducts products={data?.recent_products || []} />
        </div>
      </div>
    </>
  );
}
