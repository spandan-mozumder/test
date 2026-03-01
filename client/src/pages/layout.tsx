import { useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import {
  ShoppingCart01,
  LogOut01,
  User01,
  BarChartSquare02,
  Package,
  ClockRewind,
  Home01,
} from "@untitledui/icons";
import toast from "react-hot-toast";
import { animate, stagger } from "animejs";

const NavLink = ({
  to,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  to: string;
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${active
        ? "bg-brand-primary text-brand-secondary"
        : "text-tertiary hover:bg-secondary hover:text-primary"
      }`}
  >
    <Icon className="size-4" />
    {label}
  </button>
);

export const AppLayout = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { totalItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!navRef.current) return;
    animate(navRef.current.querySelectorAll(".nav-item"), {
      opacity: [0, 1],
      translateY: [-8, 0],
      delay: stagger(50),
      duration: 450,
      ease: "outExpo",
    });
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-dvh flex-col bg-primary">
      <header
        className="sticky top-0 z-50 border-b border-secondary bg-primary/80 backdrop-blur-xl"
        ref={navRef}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="nav-item text-lg font-bold tracking-tight text-brand-tertiary"
              style={{ opacity: 0 }}
            >
              blnK
            </Link>

            <nav className="nav-item hidden items-center gap-1 md:flex" style={{ opacity: 0 }}>
              <NavLink
                to="/products"
                icon={Package}
                label="Products"
                active={isActive("/products")}
                onClick={() => navigate("/products")}
              />
              {user && (
                <NavLink
                  to="/orders"
                  icon={ClockRewind}
                  label="Orders"
                  active={isActive("/orders")}
                  onClick={() => navigate("/orders")}
                />
              )}
              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  icon={BarChartSquare02}
                  label="Dashboard"
                  active={isActive("/admin")}
                  onClick={() => navigate("/admin")}
                />
              )}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <div className="nav-item" style={{ opacity: 0 }}>
              <button
                onClick={() => navigate("/cart")}
                className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-tertiary transition-all duration-200 hover:bg-secondary hover:text-primary cursor-pointer"
              >
                <ShoppingCart01 className="size-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-solid px-1.5 text-xs font-semibold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {user ? (
              <>
                <div className="nav-item" style={{ opacity: 0 }}>
                  <button
                    onClick={() =>
                      navigate(user.role === "admin" ? "/admin" : "/orders")
                    }
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-tertiary transition-all duration-200 hover:bg-secondary hover:text-primary cursor-pointer"
                  >
                    <User01 className="size-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </button>
                </div>
                <div className="nav-item" style={{ opacity: 0 }}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-tertiary transition-all duration-200 hover:bg-error-primary hover:text-error-primary cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut01 className="size-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="nav-item" style={{ opacity: 0 }}>
                  <Button
                    color="link-gray"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </Button>
                </div>
                <div className="nav-item" style={{ opacity: 0 }}>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-secondary bg-primary px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link
              to="/"
              className="text-lg font-bold text-brand-tertiary"
            >
              blnK
            </Link>
            <p className="text-sm text-tertiary">
              &copy; {new Date().getFullYear()} blnK. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
