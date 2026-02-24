import React from "react";
import { motion } from "motion/react";
import { RefreshCw, Search, ChevronRight, AlertTriangle, CheckCircle2, Loader2, Download } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";
import { Product } from "../../types";

interface ListViewProps {
    products: Product[];
    filteredProducts: Product[];
    loading: boolean;
    hasMore: boolean;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    refreshProducts: () => void;
    loadMore: () => void;
    updateCost: (id: number, cost: number) => Promise<void>;
    onSelectProduct: (product: Product) => void;
    exportProducts: () => void;
    importCosts: (file: File) => Promise<void>;
}

export const ListView = ({
    products,
    filteredProducts,
    loading,
    hasMore,
    searchTerm,
    setSearchTerm,
    refreshProducts,
    loadMore,
    updateCost,
    onSelectProduct,
    exportProducts,
    importCosts
}: ListViewProps) => {
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
            className="space-y-4"
        >
            <div className="flex justify-between items-center bg-white p-4 border border-zinc-200 rounded-xl shadow-sm">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Total Produtos</span>
                        <span className="text-xl font-mono">{products.length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Sem Custo</span>
                        <span className="text-xl font-mono text-rose-500">{products.filter(p => !p.cost).length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportProducts}
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                            title="Exportar Catálogo"
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
                        <button
                            onClick={refreshProducts}
                            disabled={loading}
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-bottom border-zinc-100 bg-zinc-50/50">
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Produto</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Venda</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Custo (R$)</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Margem</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Markup</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-zinc-400 tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredProducts.map((product) => {
                                const price = parseFloat(product.price);
                                const margin = product.cost > 0 ? ((price - product.cost) / price) * 100 : 0;
                                const markup = product.cost > 0 ? price / product.cost : 0;

                                return (
                                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                                                    {product.images[0] && (
                                                        <img src={product.images[0].src} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-zinc-900 line-clamp-1">{product.name}</div>
                                                    <div className="text-[10px] text-zinc-400 font-mono">ID: {product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-mono">R$ {price.toFixed(2)}</td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={product.cost || ""}
                                                onBlur={(e) => updateCost(product.id, parseFloat(e.target.value) || 0)}
                                                className="w-24 p-1.5 border border-zinc-200 rounded text-sm font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("text-sm font-mono", margin < 30 ? "text-rose-500" : "text-emerald-600")}>
                                                    {margin.toFixed(1)}%
                                                </span>
                                                {margin > 0 && (
                                                    margin < 30 ? <AlertTriangle size={12} className="text-rose-500" /> : <CheckCircle2 size={12} className="text-emerald-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-mono text-zinc-500">
                                            {markup > 0 ? `${markup.toFixed(2)}x` : "-"}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => onSelectProduct(product)}
                                                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                                            >
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
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Carregar mais produtos"}
                        </button>
                    </div>
                )}
            </Card>
        </motion.div>
    );
};
