export const navItem: NavItemTypes[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "Shops",
    href: "/shops",
  },
  {
    title: "Become A Seller",
    href: `${process.env.NEXT_PUBLIC_SELLER_SERVER_UI}/signup`,
  },
];
