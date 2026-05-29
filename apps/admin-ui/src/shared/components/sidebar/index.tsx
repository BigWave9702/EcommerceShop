import useSidebar from 'apps/admin-ui/src/hooks/useSidebar'
import {usePathname} from 'next/navigation';
import React from 'react'

const SidebarWrapper = () => {
  const {activeSidebar, setActiveSidebar}=useSidebar();
  const pathName=usePathname();
  const {}

  return (
    <div>SidebarWrapper</div>
  )
}

export default SidebarWrapper
