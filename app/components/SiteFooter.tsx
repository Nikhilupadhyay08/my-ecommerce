import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      id="store-footer"
      className="mt-auto scroll-mt-4 border-t border-gray-200 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-lg font-extrabold tracking-tight text-gray-900">
              NIKHIL <span className="text-blue-600">STORE</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600">
              Quality picks, simple checkout, and categories to help you find
              what you need—on any screen size.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Shop
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 transition hover:text-blue-600"
                >
                  All products
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-gray-600 transition hover:text-blue-600"
                >
                  Checkout
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-gray-600 transition hover:text-blue-600"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-gray-600 transition hover:text-blue-600"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Manage
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/admin"
                  className="text-gray-600 transition hover:text-blue-600"
                >
                  Admin panel
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-center text-xs text-gray-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Nikhil Store. All rights reserved.</p>
          <p className="max-w-sm sm:text-right">
            Built with Next.js · Cash on delivery available at checkout
          </p>
        </div>
      </div>
    </footer>
  );
}
