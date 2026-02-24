import React from "react";
import {
  BarChart3,
  LayoutGrid,
  Settings,
  Search,
  ShoppingBag
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { useStore } from "./hooks/useStore";
import { DashboardView } from "./components/views/DashboardView";
import { ListView } from "./components/views/ListView";
import { ConfigView } from "./components/views/ConfigView";
import { DetailView } from "./components/views/DetailView";
import { OrdersView } from "./components/views/OrdersView";

export default function App() {
  const {
    view,
    setView,
    config,
    products,
    orders,
    loading,
    hasMore,
    selectedProduct,
    setSelectedProduct,
    analysis,
    analyzing,
    searchTerm,
    setSearchTerm,
    loadMore,
    updateCost,
    analyzeProduct,
    saveConfig,
    syncData,
    syncing,
    syncProgress,
    syncError,
    filteredProducts,
    stats,
    refreshProducts,
    exportProducts,
    exportOrders,
    importCosts,
    statsPeriod,
    setStatsPeriod,
    orderSearch,
    setOrderSearch,
    orderPage,
    setOrderPage,
    orderDateRange,
    setOrderDateRange,
    orderValueRange,
    setOrderValueRange,
    filteredOrders,
    hasMoreOrders
  } = useStore();

  // Expose setView globally for quick navigation from components
  React.useEffect(() => {
    (window as any).setView = setView;
  }, [setView]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar / Nav */}
      <nav className="fixed top-0 left-0 h-full w-16 bg-white border-r border-zinc-200 flex flex-col items-center py-6 gap-8 z-50">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-bold">
          CV
        </div>
        <button
          onClick={() => setView("dashboard")}
          className={cn("p-2 rounded-lg transition-colors", view === "dashboard" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
        >
          <BarChart3 size={20} />
        </button>
        <button
          onClick={() => setView("list")}
          className={cn("p-2 rounded-lg transition-colors", view === "list" || view === "detail" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
        >
          <LayoutGrid size={20} />
        </button>
        <button
          onClick={() => setView("orders")}
          className={cn("p-2 rounded-lg transition-colors", view === "orders" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
        >
          <ShoppingBag size={20} />
        </button>
        <button
          onClick={() => setView("config")}
          className={cn("p-2 rounded-lg transition-colors", view === "config" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
        >
          <Settings size={20} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="pl-16 pt-6 pr-6 pb-12 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Gestor de Margens</h1>
            <p className="text-zinc-500 text-sm">Casa Vidro E-commerce Dashboard</p>
          </div>
          {view === "list" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <DashboardView
              stats={stats}
              orders={orders}
              products={products}
              syncData={syncData}
              syncing={syncing}
              syncProgress={syncProgress}
              syncError={syncError}
              statsPeriod={statsPeriod}
              setStatsPeriod={setStatsPeriod}
            />
          )}

          {view === "config" && (
            <ConfigView
              config={config}
              saveConfig={saveConfig}
            />
          )}

          {view === "list" && (
            <ListView
              products={products}
              filteredProducts={filteredProducts}
              loading={loading}
              hasMore={hasMore}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              refreshProducts={refreshProducts}
              loadMore={loadMore}
              updateCost={updateCost}
              onSelectProduct={(p) => {
                setSelectedProduct(p);
                setView("detail");
                analyzeProduct(p);
              }}
              exportProducts={exportProducts}
              importCosts={importCosts}
            />
          )}

          {view === "orders" && (
            <OrdersView
              orders={filteredOrders}
              loading={loading}
              hasMore={hasMoreOrders}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              orderDateRange={orderDateRange}
              setOrderDateRange={setOrderDateRange}
              orderValueRange={orderValueRange}
              setOrderValueRange={setOrderValueRange}
              loadMore={() => setOrderPage(p => p + 1)}
              exportOrders={exportOrders}
              exportProducts={exportProducts}
              importCosts={importCosts}
            />
          )}

          {view === "detail" && selectedProduct && (
            <DetailView
              product={selectedProduct}
              analysis={analysis}
              analyzing={analyzing}
              onBack={() => setView("list")}
              onAnalyze={analyzeProduct}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
