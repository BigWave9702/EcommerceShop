"use client";
import { useQuery } from "@tanstack/react-query";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import {
  Boxes,
  ClipboardList,
  DollarSign,
  PackageX,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res?.data?.orders || [];
};

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res?.data?.products || [];
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="bg-gray-900 rounded-lg p-5 flex items-center gap-4">
    <div className="p-3 rounded-full bg-gray-800">{icon}</div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const Page = () => {
  const { seller } = useSeller();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o: any) => o.status === "Paid");
    const revenue = paidOrders.reduce(
      (sum: number, o: any) => sum + o.total * 0.9,
      0
    );
    const pendingOrders = orders.filter((o: any) => o.status !== "Paid").length;
    const lowStockProducts = products.filter((p: any) => p.stock < 10).length;

    return {
      revenue,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length,
      lowStockProducts,
    };
  }, [orders, products]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const isLoading = ordersLoading || productsLoading;

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-1">
        Welcome back{seller?.shop?.name ? `, ${seller.shop.name}` : ""}
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Here&apos;s an overview of your shop performance.
      </p>

      {isLoading ? (
        <p className="text-white">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={<DollarSign className="text-green-400" />}
              label="Total Revenue (net)"
              value={`$${stats.revenue.toFixed(2)}`}
            />
            <StatCard
              icon={<ClipboardList className="text-blue-400" />}
              label="Total Orders"
              value={stats.totalOrders}
            />
            <StatCard
              icon={<ClipboardList className="text-yellow-400" />}
              label="Pending Orders"
              value={stats.pendingOrders}
            />
            <StatCard
              icon={<Boxes className="text-purple-400" />}
              label="Total Products"
              value={stats.totalProducts}
            />
          </div>

          {stats.lowStockProducts > 0 && (
            <div className="mt-4 flex items-center gap-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg px-4 py-3">
              <PackageX size={20} />
              <span>
                {stats.lowStockProducts} product
                {stats.lowStockProducts > 1 ? "s are" : " is"} running low on
                stock (below 10 units).{" "}
                <Link href="/dashboard/all-products" className="underline">
                  Review products
                </Link>
              </span>
            </div>
          )}

          <div className="mt-8 bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Recent Orders</h3>
              <Link
                href="/dashboard/orders"
                className="text-blue-400 text-sm hover:underline"
              >
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet.</p>
            ) : (
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Buyer</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-800">
                      <td className="p-2">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="p-2">{order.user?.name ?? "Guest"}</td>
                      <td className="p-2">${order.total}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Paid"
                              ? "bg-green-600 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
