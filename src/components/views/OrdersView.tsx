import React from "react";
import { motion } from "motion/react";
import {
    Search,
    Calendar,
    Filter,
    ChevronRight,
    Loader2,
    ArrowUpDown,
    Download
} from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn, formatCurrency } from "../../lib/utils";
import { Order } from "../../types";

interface OrdersViewProps {
    orders: Order[];
    loading: boolean;
    hasMore: boolean;
    orderSearch: string;
    setOrderSearch: (val: string) => void;
    orderDateRange: { start: string; end: string };
    setOrderDateRange: (val: { start: string; end: string }) => void;
    orderValueRange: { min: number; max: number };
    setOrderValueRange: (val: { min: number; max: number }) => void;
    loadMore: () => void;
    onOrderProgress?: (order: Order) => void;
    exportOrders: () => void;
    exportProducts: () => void;
    importCosts: (file: File) => Promise<void>;
}

export const OrdersView = ({
    orders,
    loading,
    hasMore,
    orderSearch,
    setOrderSearch,
    orderDateRange,
    setOrderDateRange,
    orderValueRange,
    setOrderValueRange,
    loadMore,
    exportOrders,
    exportProducts,
    importCosts
}: OrdersViewProps) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await importCosts(file);
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* Filter Bar */}
            <div className="bg-white p-4 border border-zinc-200 rounded-xl shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 ml-1">Buscar Pedido</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input
                            type="text"
                            placeholder="Número do pedido..."
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 ml-1">Data Início</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input
                            type="date"
                            className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none transition-all"
                            value={orderDateRange.start}
                            onChange={(e) => setOrderDateRange({ ...orderDateRange, start: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 ml-1">Data Fim</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input
                            type="date"
                            className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none transition-all"
                            value={orderDateRange.end}
                            onChange={(e) => setOrderDateRange({ ...orderDateRange, end: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 ml-1">Valor Mínimo</label>
                    <input
                        type="number"
                        placeholder="R$ 0,00"
                        className="w-24 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none transition-all"
                        value={orderValueRange.min || ""}
                        onChange={(e) => setOrderValueRange({ ...orderValueRange, min: parseFloat(e.target.value) || 0 })}
                    />
                </div>

                <div className="flex gap-2">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors border border-zinc-200 rounded-lg bg-zinc-50">
                        <Filter size={18} />
                    </button>
                    <button
                        onClick={exportOrders}
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors border border-zinc-200 rounded-lg bg-zinc-50"
                        title="Exportar Pedidos"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors border border-zinc-200 rounded-lg bg-zinc-50"
                        title="Importar Custos"
                    >
                        Importar Custos
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                    />
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-bottom border-zinc-100 bg-zinc-50/50">
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Pedido</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Cliente / Contato</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Data</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Status</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Total</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Lucro</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Margem</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {orders.map((order) => {
                                const total = parseFloat(order.total);
                                const margin = total > 0 ? (order.profit / total) * 100 : 0;
                                const date = new Date(order.date_created).toLocaleDateString("pt-BR");

                                return (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-zinc-900">#{order.number}</span>
                                                <span className="text-[10px] text-zinc-400">ID: {order.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-zinc-900 truncate max-w-[150px]">{order.customer_name}</span>
                                                <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">{order.customer_email}</span>
                                                {order.customer_phone !== "N/A" && (
                                                    <span className="text-[10px] text-emerald-600 truncate max-w-[150px] font-medium">{order.customer_phone}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-zinc-600">{date}</td>
                                        <td className="p-4">
                                            <Badge variant={
                                                order.status === "completed" ? "healthy" :
                                                    order.status === "processing" ? "warning" : "neutral"
                                            }>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-sm font-mono font-medium">{formatCurrency(total)}</td>
                                        <td className={cn("p-4 text-sm font-mono font-bold", order.profit > 0 ? "text-emerald-600" : "text-rose-600")}>
                                            {formatCurrency(order.profit)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full", margin >= 30 ? "bg-emerald-500" : margin > 0 ? "bg-amber-500" : "bg-rose-500")}
                                                        style={{ width: `${Math.min(Math.max(margin, 0), 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold font-mono text-zinc-500">{margin.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="p-4 border-t border-zinc-100 flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Carregar mais pedidos"}
                        </button>
                    </div>
                )}
            </Card>
        </motion.div>
    );
};
