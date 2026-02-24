import { useState, useEffect, useCallback } from "react";
import { Product, StoreConfig, Order, ProductAnalysis } from "../types";

export const useStore = () => {
    const [view, setView] = useState<"list" | "config" | "detail" | "dashboard" | "orders">("dashboard");
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState<string>("");
    const [syncError, setSyncError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statsPeriod, setStatsPeriod] = useState<"30" | "90" | "all">("30");
    const [orderSearch, setOrderSearch] = useState("");
    const [orderPage, setOrderPage] = useState(1);
    const [orderDateRange, setOrderDateRange] = useState({ start: "", end: "" });
    const [orderValueRange, setOrderValueRange] = useState({ min: 0, max: 0 });

    const fetchProducts = useCallback(async (pageNum: number, reset: boolean = false) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?page=${pageNum}&per_page=20`);
            const data = await res.json();
            if (Array.isArray(data)) {
                if (reset) {
                    setProducts(data);
                } else {
                    setProducts(prev => [...prev, ...data]);
                }
                setHasMore(data.length === 20);
                setPage(pageNum);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch("/api/config");
            const data = await res.json();
            if (data) {
                setConfig(data);
                fetchProducts(1, true);
                fetchOrders();
            } else {
                setView("config");
            }
        } catch (err) {
            console.error(err);
        }
    }, [fetchProducts, fetchOrders]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchProducts(page + 1);
        }
    }, [loading, hasMore, page, fetchProducts]);

    const updateCost = async (id: number, cost: number) => {
        try {
            await fetch(`/api/products/${id}/cost`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cost }),
            });
            setProducts(prev => prev.map(p => p.id === id ? { ...p, cost } : p));
        } catch (err) {
            console.error(err);
        }
    };

    const analyzeProduct = async (product: Product) => {
        setAnalyzing(true);
        setAnalysis(null);
        const price = parseFloat(product.price);
        const cost = product.cost;
        const margin = cost > 0 ? ((price - cost) / price) * 100 : 0;
        const markup = cost > 0 ? price / cost : 0;

        try {
            const res = await fetch(`/api/products/${product.id}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: product.name,
                    price,
                    cost,
                    margin,
                    markup
                }),
            });
            const data = await res.json();
            setAnalysis(data);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    const saveConfig = async (data: any) => {
        await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const configData = {
            ...data,
            tax_rate: parseFloat(data.tax_rate as string) || 0,
            gateway_fee: parseFloat(data.gateway_fee as string) || 0,
            fixed_fee: parseFloat(data.fixed_fee as string) || 0,
        } as StoreConfig;
        setConfig(configData);
        setView("dashboard");
        // Don't fetch from WC here, user must sync manually or initial sync occurs
    };

    const syncData = async (force: boolean = false) => {
        setSyncing(true);
        setSyncError(null);
        setSyncProgress("Conectando...");

        const eventSource = new EventSource("/api/sync/progress");
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.message) {
                    setSyncProgress(data.message);
                }
            } catch (e) {
                // Ignore parse errors
            }
        };

        try {
            const res = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force }),
            });
            const data = await res.json();
            if (data.success) {
                setSyncProgress("Concluído!");
                await fetchProducts(1, true);
                await fetchOrders();
            } else {
                setSyncError(data.error || "Erro desconhecido ao sincronizar");
            }
        } catch (err: any) {
            console.error(err);
            setSyncError("Falha na comunicação com o servidor.");
        } finally {
            eventSource.close();
            setSyncing(false);
            setTimeout(() => setSyncProgress(""), 3000);
        }
    };

    const exportProducts = useCallback(async () => {
        try {
            const res = await fetch("/api/export/products");
            if (!res.ok) throw new Error("Falha na exportação");

            const contentDisposition = res.headers.get("Content-Disposition");
            let filename = "produtos.xlsx";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Erro ao exportar produtos. Cheque o console.");
        }
    }, []);

    const exportOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/export/orders");
            if (!res.ok) throw new Error("Falha na exportação");

            const contentDisposition = res.headers.get("Content-Disposition");
            let filename = "pedidos.xlsx";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Erro ao exportar pedidos. Cheque o console.");
        }
    }, []);

    const importCosts = useCallback(async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/import/costs", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                alert(`Importado com sucesso! ${data.count} produtos atualizados.`);
                await fetchProducts(1, true);
            } else {
                alert(`Erro ao importar: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Erro na comunicação com o servidor.");
        }
    }, [fetchProducts]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.number.includes(orderSearch);
        const date = new Date(o.date_created).getTime();
        const start = orderDateRange.start ? new Date(orderDateRange.start).getTime() : 0;
        const end = orderDateRange.end ? new Date(orderDateRange.end).getTime() : Infinity;
        const matchesDate = date >= start && date <= end;
        const total = parseFloat(o.total);
        const matchesMinPrice = orderValueRange.min ? total >= orderValueRange.min : true;
        const matchesMaxPrice = orderValueRange.max ? total <= orderValueRange.max : true;

        return matchesSearch && matchesDate && matchesMinPrice && matchesMaxPrice;
    });

    const dashboardOrders = orders.filter(o => {
        if (statsPeriod === "all") return true;
        const date = new Date(o.date_created).getTime();
        const now = new Date().getTime();
        const days = parseInt(statsPeriod) * 24 * 60 * 60 * 1000;
        return (now - date) <= days;
    });

    const paginatedOrders = filteredOrders.slice(0, orderPage * 20);
    const hasMoreOrders = paginatedOrders.length < filteredOrders.length;

    const stats = {
        total: products.length,
        withCost: products.filter(p => p.cost > 0).length,
        avgMargin: products.filter(p => p.cost > 0).reduce((acc, p) => acc + (((parseFloat(p.price) - p.cost) / parseFloat(p.price)) * 100), 0) / (products.filter(p => p.cost > 0).length || 1),
        avgMarkup: products.filter(p => p.cost > 0).reduce((acc, p) => acc + (parseFloat(p.price) / p.cost), 0) / (products.filter(p => p.cost > 0).length || 1),
        healthy: products.filter(p => p.cost > 0 && (((parseFloat(p.price) - p.cost) / parseFloat(p.price)) * 100) >= 30).length,
        warning: products.filter(p => p.cost > 0 && (((parseFloat(p.price) - p.cost) / parseFloat(p.price)) * 100) < 30 && (((parseFloat(p.price) - p.cost) / parseFloat(p.price)) * 100) > 0).length,
        critical: products.filter(p => p.cost > 0 && (((parseFloat(p.price) - p.cost) / parseFloat(p.price)) * 100) <= 0).length,
        totalSales: dashboardOrders.reduce((acc, o) => acc + parseFloat(o.total), 0),
        totalProfit: dashboardOrders.reduce((acc, o) => acc + o.profit, 0),
        avgOrderProfit: dashboardOrders.reduce((acc, o) => acc + o.profit, 0) / (dashboardOrders.length || 1),
    };

    return {
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
        syncing,
        syncProgress,
        syncError,
        searchTerm,
        setSearchTerm,
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
        loadMore,
        updateCost,
        analyzeProduct,
        saveConfig,
        syncData,
        exportProducts,
        exportOrders,
        importCosts,
        filteredProducts,
        filteredOrders: paginatedOrders,
        hasMoreOrders,
        stats,
        refreshProducts: () => fetchProducts(1, true)
    };
};
