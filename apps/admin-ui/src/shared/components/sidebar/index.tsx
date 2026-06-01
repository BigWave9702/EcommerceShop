"use client";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import Link from "next/link";
import SidebarItem from "./sidebar.item";
import {
  BellPlus,
  BellRing,
  FileClock,
  Home,
  ListOrdered,
  LogOut,
  PackageSearch,
  PencilRuler,
  Settings,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import SidebarMenu from "./sidebar.menu";
import { Sidebar } from "./sidebar.styles";
import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import useSidebar from "apps/admin-ui/src/hooks/useSidebar";
import Logo from "apps/admin-ui/src/assets/svgs/logo";

const SideBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { admin } = useAdmin();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

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
                {admin?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {admin?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home color={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
                isActive={activeSidebar === "/dashboard/orders"}
                href="/dashboard/orders"
              />
              <SidebarItem
                title="Payments"
                icon={<Wallet color={getIconColor("/dashboard/payments")} />}
                isActive={activeSidebar === "/dashboard/payments"}
                href="/dashboard/payments"
              />
              <SidebarItem
                title="Products"
                isActive={activeSidebar === "/dashboard/products"}
                href="/dashboard/products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/products")}
                  />
                }
              />
              <SidebarItem
                title="Events"
                isActive={activeSidebar === "/dashboard/events"}
                href="/dashboard/events"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/events")}
                  />
                }
              />
              <SidebarItem
                title="Users"
                isActive={activeSidebar === "/dashboard/users"}
                href="/dashboard/users"
                icon={
                  <Users size={24} color={getIconColor("/dashboard/users")} />
                }
              />
              <SidebarItem
                title="Sellers"
                isActive={activeSidebar === "/dashboard/sellers"}
                href="/dashboard/sellers"
                icon={
                  <Store size={24} color={getIconColor("/dashboard/sellers")} />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Loggers"
                isActive={activeSidebar === "/dashboard/loggers"}
                href="/dashboard/loggers"
                icon={
                  <FileClock
                    size={22}
                    color={getIconColor("/dashboard/loggers")}
                  />
                }
              />
              <SidebarItem
                title="Management"
                isActive={activeSidebar === "/dashboard/management"}
                href="/dashboard/management"
                icon={
                  <Settings
                    size={22}
                    color={getIconColor("/dashboard/management")}
                  />
                }
              />
              <SidebarItem
                title="Notifications"
                isActive={activeSidebar === "/dashboard/notifications"}
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Customization">
              <SidebarItem
                title="All Customization"
                isActive={activeSidebar === "/dashboard/customization"}
                href="/dashboard/customization"
                icon={
                  <PencilRuler
                    size={24}
                    color={getIconColor("/dashboard/customization")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                title="Logout"
                isActive={activeSidebar === "/logout"}
                href="/"
                icon={<LogOut size={24} color={getIconColor("/logout")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SideBarWrapper;
