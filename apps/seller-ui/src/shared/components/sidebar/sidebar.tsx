"use client";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import useSidebar from "apps/seller-ui/src/hooks/useSidebar";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import Logo from "apps/seller-ui/src/assets/svgs/logo";
import SidebarItem from "./sidebar.item";
import {BellPlus, BellRing, Calendar, LayoutDashboard, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent, Wallet} from "lucide-react";
import SidebarMenu from "./sidebar.menu";

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { seller } = useSeller();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await axiosInstance.post("/api/logout");
    } catch (error) {
      console.log(error);
    } finally {
      queryClient.clear();
      router.push("/login");
    }
  };

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Logo />
            <Box className="text-left">
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-2 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<LayoutDashboard color={getIconColor("/dashboard")} />}
            isActive={activeSidebar==="/dashboard"}
            href="/dashboard"
          />
          <div className="mt-1 block">
            <SidebarMenu  title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={<ListOrdered size={26} color={getIconColor("/dashboard/orders")} />}
                isActive={activeSidebar==="/dashboard/orders"}
                href="/dashboard/orders"
              />
              <SidebarItem
                title="Payments"
                icon={<Wallet color={getIconColor("/dashboard/payments")} />}
                isActive={activeSidebar==="/dashboard/payments"}
                href="/dashboard/payments"
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                isActive={activeSidebar==="/dashboard/create-product"}
                href="/dashboard/create-product"
                icon={<SquarePlus size={24} color={getIconColor("/dashboard/create-product")} />}
              />
              <SidebarItem
                title="All Products"
                isActive={activeSidebar==="/dashboard/all-products"}
                href="/dashboard/all-products"
                icon={<PackageSearch size={22} color={getIconColor("/dashboard/all-products")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                isActive={activeSidebar==="/dashboard/create-event"}
                href="/dashboard/create-event"
                icon={<Calendar size={24} color={getIconColor("/dashboard/create-event")} />}
              />
              <SidebarItem
                title="All Events"
                isActive={activeSidebar==="/dashboard/all-events"}
                href="/dashboard/all-events"
                icon={<BellPlus size={22} color={getIconColor("/dashboard/all-events")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                isActive={activeSidebar==="/dashboard/inbox"}
                href="/dashboard/inbox"
                icon={<Mail size={20} color={getIconColor("/dashboard/inbox")} />}
              />
              <SidebarItem
                title="Settings"
                isActive={activeSidebar==="/dashboard/settings"}
                href="/dashboard/settings"
                icon={<Settings size={22} color={getIconColor("/dashboard/settings")} />}
              />
              <SidebarItem
                title="Notifications"
                isActive={activeSidebar==="/dashboard/notifications"}
                href="/dashboard/notifications"
                icon={<BellRing size={24} color={getIconColor("/dashboard/notifications")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                isActive={activeSidebar==="/dashboard/discount-codes"}
                href="/dashboard/discount-codes"
                icon={<TicketPercent size={24} color={getIconColor("/dashboard/discount-codes")} />}
              />
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="my-1 flex gap-2 w-full min-h-10 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31] disabled:opacity-60"
              >
                <LogOut size={24} color={getIconColor("/logout")} />
                <h5 className="text-slate-200 text-base">
                  {loggingOut ? "Logging out..." : "Logout"}
                </h5>
              </button>
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarBarWrapper;
