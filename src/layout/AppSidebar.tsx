import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  // CalenderIcon,
  ChevronDownIcon,
  DocsIcon,
  // DollarLineIcon,
  EnvelopeIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  PlugInIcon,
  LockIcon,
  ShootingStarIcon,
  // TaskIcon,
  ChatIcon,
  FolderIcon,
  ListIcon,
  TableIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string | number;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const staticNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/"
  },
  {
    icon: <FolderIcon />,
    name: "Main Categories",
    path: "/main-categories",
  },
  {
    icon: <GridIcon />,
    name: "Brands",
    path: "/brands",
  },
  {
    icon: <FolderIcon />,
    name: "Categories",
    path: "/categories",
  },
  {
    icon: <ListIcon />,
    name: "Sub-Categories",
    path: "/sub-categories",
  },

  {
    icon: <BoxCubeIcon />,
    name: "Products",
    path: "/products",
  },
  {
    icon: <TableIcon />,
    name: "Orders",
    path: "/orders",
  },
  {
    icon: <EnvelopeIcon />,
    name: "Addresses",
    path: "/addresses",
  },

  {
    icon: <DocsIcon />,
    name: "Invoices",
    path: "/invoices",
  },

  {
    icon: <ChatIcon />,
    name: "Reviews",
    path: "/reviews",
  },
  {
    icon: <ShootingStarIcon />,
    name: "Coupons",
    path: "/coupons",
  },
  {
    icon: <LockIcon />,
    name: "ACL",
    subItems: [
      { name: "Roles", path: "/acl/roles", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Settings",
    subItems: [
      { name: "Account", path: "/settings/account", pro: false },
      { name: "Security", path: "/settings/security", pro: false },
      { name: "Notifications", path: "/settings/notifications", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
      { name: "Reset Password", path: "/reset-password", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Onboarding",
    subItems: [
      { name: "Step 1", path: "/onboarding/step-1", pro: false },
      { name: "Step 2", path: "/onboarding/step-2", pro: false },
    ],
  },
  {
    icon: <DocsIcon />,
    name: "Components",
    subItems: [
      { name: "Forms", path: "/form-elements", pro: false },
      { name: "Tables", path: "/basic-tables", pro: false },
      { name: "Buttons", path: "/ui/buttons", pro: false },
      { name: "Addresses", path: "/customer-addresses", pro: false },
    ],
  },
];

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchRoles, fetchUserRoleCounts } from "../store/slices/userSlice";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { roles, roleCounts } = useSelector((state: RootState) => state.user);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchRoles({}));
    dispatch(fetchUserRoleCounts());
  }, [dispatch]);

  const navItems = useMemo(() => {
    const roleItems = roles.map(role => ({
      // name: `${role.name} (${roleCounts?.[role._id!] || 0})`,
      name: `${role.name}`,
      path: `/users/role/${role._id}`,
      pro: false
    }));

    const customersItem: NavItem = {
      icon: <GroupIcon />,
      name: "Users",
      subItems: [
        { name: "All Users", path: "/users", pro: false },
        ...roleItems
      ]
    };

    // Insert Customers item after Dashboard (index 0)
    const newItems = [...staticNavItems];
    newItems.splice(1, 0, customersItem);

    // Add Picker/Packer specific items if user has the role
    const userRoleKeys = currentUser?.role?.map((r: any) => typeof r === 'object' ? r.key?.toLowerCase() : r.toLowerCase()) || [];

    if (userRoleKeys.includes('picker') || userRoleKeys.includes('admin')) {
      newItems.push({
        icon: <ListIcon />,
        name: " Picks",
        path: "/orders/picker"
      });
    }

    if (userRoleKeys.includes('packer') || userRoleKeys.includes('admin')) {
      newItems.push({
        icon: <BoxCubeIcon />,
        name: "Packs",
        path: "/orders/packer"
      });
    }

    return newItems;
  }, [roles, roleCounts, currentUser]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {nav.badge && (isExpanded || isHovered || isMobileOpen) && (
                  <span className="ml-auto bg-brand-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                    {nav.badge}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (


    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        {/* <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link> */}

        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 shrink-0">
            <img src="/logo.jpeg" alt="Khana Fast" className="w-full h-full object-contain rounded-lg" />
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
                Khana<span className="text-brand-500 text-2xl">Fast</span>
              </span>
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase mt-1 leading-none">
                Express Delivery
              </span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Pages"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "More"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
