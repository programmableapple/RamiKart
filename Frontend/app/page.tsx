import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag, ArrowRight, Search, ShieldCheck, TrendingUp, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">RamiKart</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-200 focus:outline-none dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-50">
                    New Platform
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Buy & Sell on <span className="text-emerald-600 dark:text-emerald-400">RamiKart</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Your premier online marketplace for buying and selling products. Find amazing deals or list your own
                    items today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/listings">
                    <Button size="lg" variant="outline">
                      Browse Listings
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-xl"></div>
                  <img
                    alt="RamiKart Marketplace"
                    className="relative rounded-xl object-cover shadow-2xl"
                    height="620"
                    src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                    width="1100"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose RamiKart?</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Discover what makes RamiKart the best marketplace platform
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800">
                <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Secure Transactions</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Buy and sell with confidence using our secure payment system and buyer protection
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800">
                <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                  <Search className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Easy Discovery</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Find exactly what you're looking for with powerful search and filtering options
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800">
                <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                  <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Grow Your Business</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Reach more customers and scale your business with our powerful seller tools
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Join thousands of satisfied users
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    RamiKart connects buyers and sellers from around the world. Our platform makes it easy to find what
                    you need or sell what you don't.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      <img
                        alt="User"
                        className="h-10 w-10 rounded-full border-2 border-background"
                        src="https://ui.shadcn.com/avatars/01.png"
                      />
                      <img
                        alt="User"
                        className="h-10 w-10 rounded-full border-2 border-background"
                        src="https://ui.shadcn.com/avatars/02.png"
                      />
                      <img
                        alt="User"
                        className="h-10 w-10 rounded-full border-2 border-background"
                        src="https://ui.shadcn.com/avatars/03.png"
                      />
                      <img
                        alt="User"
                        className="h-10 w-10 rounded-full border-2 border-background"
                        src="https://ui.shadcn.com/avatars/04.png"
                      />
                    </div>
                    <span className="ml-2 text-sm font-medium">Join 10,000+ users</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Star className="mr-1 h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="mr-1 h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="mr-1 h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="mr-1 h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="mr-1 h-5 w-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">4.9/5</span> from over 2,000 reviews
                  </div>
                </div>
              </div>
              <div className="space-y-4 lg:space-y-6">
                <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-950">
                  <div className="flex items-start gap-4">
                    <img
                      alt="User"
                      className="rounded-full"
                      height="40"
                      src="https://ui.shadcn.com/avatars/05.png"
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width="40"
                    />
                    <div className="grid gap-1">
                      <div className="font-semibold">Sarah Johnson</div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        "I've been using RamiKart for over a year now and it's completely transformed my online selling
                        experience. The platform is intuitive and the customer support is exceptional!"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-950">
                  <div className="flex items-start gap-4">
                    <img
                      alt="User"
                      className="rounded-full"
                      height="40"
                      src="https://ui.shadcn.com/avatars/06.png"
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width="40"
                    />
                    <div className="grid gap-1">
                      <div className="font-semibold">Michael Chen</div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        "As a buyer, I love how easy it is to find quality products on RamiKart. The secure payment
                        system gives me peace of mind with every purchase."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-600 text-white dark:bg-emerald-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to get started?</h2>
                <p className="max-w-[600px] text-emerald-100 md:text-xl">
                  Join RamiKart today and discover a world of possibilities.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-600 hover:bg-emerald-50 dark:bg-gray-950 dark:text-emerald-400 dark:hover:bg-gray-900"
                  >
                    Create an Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-emerald-700 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-emerald-800"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-500" />
            <span className="text-lg font-bold">RamiKart</span>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">© 2023 RamiKart. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
