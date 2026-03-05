import { MainNav, BottomNav, DesignSystemAside } from "./design-system-aside";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useLocation, Link, Outlet } from "react-router-dom";

export const DesignSystemLayout = () => {
  const allRoutes = [...MainNav, ...BottomNav];
  const location = useLocation();
  const currentRoute = allRoutes.find(
    (route) => route.path === location.pathname,
  );
  const pageTitle = currentRoute?.title || "Page";
  const isDashboard = location.pathname === "/";

  return (
    <section className="flex h-screen w-screen">
      <DesignSystemAside />

      <section className="flex h-screen w-[calc(100%-240px)] flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-neutral-700">
          <div className="flex w-full items-center justify-between px-4">
            <Breadcrumb>
              <BreadcrumbList>
                {!isDashboard && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}

                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Link
              to="/"
              className="flex items-center gap-2 rounded bg-gray-200 dark:bg-white/10 px-3 py-2 text-sm hover:bg-gray-300 transition"
            >
              Exit
            </Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="h-full max-h-[100vh] w-full flex-1">
            <Outlet/>
          </main>
        </div>
      </section>
    </section>
  );
};
