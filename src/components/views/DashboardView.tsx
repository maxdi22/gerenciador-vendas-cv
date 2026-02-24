import React from "react";
import { motion } from "motion/react";
import {
    BarChart3,
    DollarSign,
    CheckCircle2,
    AlertTriangle,
    PieChart,
    TrendingUp,
    RefreshCw
} from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn, formatCurrency } from "../../lib/utils";

interface DashboardViewProps {
    stats: any;
    orders: any[];
    products: any[];
    syncData: (force?: boolean) => Promise<void>;
    syncing: boolean;
    syncProgress: string;
    syncError: string | null;
    statsPeriod: "30" | "90" | "all";
    setStatsPeriod: (val: "30" | "90" | "all") => void;
}

export const DashboardView = ({
    stats,
    orders,
    products,
    syncData,
    syncing,
    syncProgress,
    syncError,
    statsPeriod,
    setStatsPeriod
}: DashboardViewProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Visão geral do desempenho da sua loja</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => syncData(false)}
                            disabled={syncing}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                                syncing
                                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95"
                            )}
                            title="Baixar apenas novos pedidos"
                        >
                            <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                            <span className="text-sm">{syncing ? "Sincronizando..." : "Sincronizar Rápido"}</span>
                        </button>
                        <button
                            onClick={() => syncData(true)}
                            disabled={syncing}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all group relative",
                                syncing
                                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                    : "bg-zinc-800 text-white hover:bg-zinc-900 shadow-lg shadow-zinc-500/20 active:scale-95"
                            )}
                            title="Baixar histórico completo (Aviso: Vercel possui limite de 10s. Recomendado rodar localmente!)"
                        >
                            <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                            <span className="text-sm">{syncing ? "Sincronizando..." : "Sinc. Completa"}</span>
                        </button>
                    </div>
                    {syncProgress && (
                        <div className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md mb-1 animate-pulse">
                            {syncProgress}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 bg-white p-1 border border-zinc-200 rounded-lg w-fit shadow-sm">
                {(["30", "90", "all"] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setStatsPeriod(p)}
                        className={cn(
                            "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                            statsPeriod === p
                                ? "bg-zinc-900 text-white"
                                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                        )}
                    >
                        {p === "all" ? "Histórico Total" : `Últimos ${p} dias`}
                    </button>
                ))}
            </div>

            {syncError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Erro na Sincronização</p>
                        <p className="opacity-80">{syncError}</p>
                        <p className="text-[10px] mt-2 text-rose-400">Verifique sua URL e as chaves de API nas configurações.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase">Lucro Total (Pedidos)</div>
                            <div className="text-2xl font-mono font-semibold">{formatCurrency(stats.totalProfit || 0)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase">Vendas Totais</div>
                            <div className="text-2xl font-mono font-semibold">{formatCurrency(stats.totalSales || 0)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase">Saúde do Catálogo</div>
                            <div className="text-2xl font-mono font-semibold">{((stats.healthy / (stats.withCost || 1)) * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase">Pendentes Custo</div>
                            <div className="text-2xl font-mono font-semibold">{stats.total - stats.withCost}</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                        <PieChart size={16} /> Distribuição de Rentabilidade
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-600 font-medium">Saudável (&gt;30%)</span>
                                <span className="font-mono">{stats.healthy} produtos</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(stats.healthy / (stats.withCost || 1)) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-amber-600 font-medium">Atenção (0-30%)</span>
                                <span className="font-mono">{stats.warning} produtos</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${(stats.warning / (stats.withCost || 1)) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-rose-600 font-medium">Crítico (&lt;0%)</span>
                                <span className="font-mono">{stats.critical} produtos</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500" style={{ width: `${(stats.critical / (stats.withCost || 1)) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp size={16} /> Top Produtos por Margem
                    </h3>
                    <div className="space-y-3">
                        {products
                            .filter(p => p.cost > 0)
                            .sort((a, b) => {
                                const marginA = (parseFloat(a.price) - a.cost) / parseFloat(a.price);
                                const marginB = (parseFloat(b.price) - b.cost) / parseFloat(b.price);
                                return marginB - marginA;
                            })
                            .slice(0, 5)
                            .map(product => (
                                <div key={product.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-100 overflow-hidden">
                                            {product.images[0] && <img src={product.images[0].src} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="text-xs font-medium line-clamp-1 max-w-[150px]">{product.name}</span>
                                    </div>
                                    <span className="text-xs font-mono text-emerald-600 font-bold">
                                        {(((parseFloat(product.price) - product.cost) / parseFloat(product.price)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                    </div>
                </Card>

                <Card className="p-6 md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <BarChart3 size={16} /> Pedidos Recentes e Rentabilidade
                        </h3>
                        <button
                            onClick={() => (window as any).setView("orders")}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded"
                        >
                            Ver Todos
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-bottom border-zinc-100 bg-zinc-50/50">
                                    <th className="p-3 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Pedido</th>
                                    <th className="p-3 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Total</th>
                                    <th className="p-3 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Cliente / Contato</th>
                                    <th className="p-3 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Custo</th>
                                    <th className="p-3 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Taxas</th>
                                    <th className="p-3 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Lucro</th>
                                    <th className="p-3 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">% Margem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {orders.slice(0, 10).map((order) => {
                                    const total = parseFloat(order.total || "0");
                                    const margin = total > 0 ? (order.profit / total) * 100 : 0;
                                    return (
                                        <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="p-3 text-xs font-medium">
                                                <div className="flex flex-col">
                                                    <span>#{order.number}</span>
                                                    <span className="text-[10px] text-zinc-400 font-normal">{new Date(order.date_created).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs font-mono text-rose-500">
                                                <div className="flex flex-col">
                                                    <span>-{formatCurrency(order.total_cost || 0)}</span>
                                                    <span className="text-[9px] opacity-60">({total > 0 ? ((order.total_cost / total) * 100).toFixed(0) : 0}%)</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-zinc-900 truncate max-w-[150px]">{order.customer_name}</span>
                                                    <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">{order.customer_email}</span>
                                                    {order.customer_phone !== "N/A" && (
                                                        <span className="text-[10px] text-emerald-600 truncate max-w-[150px] font-medium">{order.customer_phone}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs font-mono text-zinc-400">
                                                <div className="flex flex-col">
                                                    <span>-{formatCurrency((order.taxes || 0) + (order.gateway_fees || 0))}</span>
                                                    <span className="text-[9px] opacity-60">({total > 0 ? (((order.taxes + order.gateway_fees) / total) * 100).toFixed(0) : 0}%)</span>
                                                </div>
                                            </td>
                                            <td className={cn("p-3 text-xs font-mono font-bold", order.profit > 0 ? "text-emerald-600" : "text-rose-600")}>
                                                {formatCurrency(order.profit || 0)}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={margin >= 30 ? "healthy" : margin > 0 ? "warning" : "critical"}>
                                                    {margin.toFixed(1)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};
