import React from "react";
import { motion } from "motion/react";
import { TrendingUp, ExternalLink, Info, Loader2, ChevronRight } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Product, ProductAnalysis } from "../../types";

interface DetailViewProps {
    product: Product;
    analysis: ProductAnalysis | null;
    analyzing: boolean;
    onBack: () => void;
    onAnalyze: (p: Product) => void;
}

export const DetailView = ({ product, analysis, analyzing, onBack, onAnalyze }: DetailViewProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            <div className="md:col-span-2 space-y-6">
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-xl bg-zinc-100 overflow-hidden">
                                {product.images[0] && (
                                    <img src={product.images[0].src} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                                <div className="flex gap-2 items-center mb-4">
                                    <Badge variant="neutral">WooCommerce</Badge>
                                    <a href={product.permalink} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-900">Voltar para lista</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Preço Venda</div>
                            <div className="text-lg font-mono">R$ {parseFloat(product.price).toFixed(2)}</div>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Custo Atual</div>
                            <div className="text-lg font-mono">R$ {(product.cost || 0).toFixed(2)}</div>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Margem Bruta</div>
                            <div className="text-lg font-mono text-emerald-600">
                                {product.cost > 0 ? (((parseFloat(product.price || "0") - product.cost) / parseFloat(product.price || "1")) * 100).toFixed(1) : "0"}%
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Markup</div>
                            <div className="text-lg font-mono text-zinc-600">
                                {product.cost > 0 ? (parseFloat(product.price || "0") / product.cost).toFixed(2) : "0"}x
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp size={16} /> Histórico e Tendências
                    </h3>
                    <div className="h-48 flex items-end gap-2 px-2">
                        {[40, 65, 45, 90, 85, 70, 75].map((h, i) => (
                            <div key={i} className="flex-1 bg-zinc-100 rounded-t-lg relative group transition-all hover:bg-zinc-200" style={{ height: `${h}%` }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-zinc-400 font-bold uppercase">
                        <span>Jan</span>
                        <span>Jul</span>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="p-6 bg-zinc-900 text-white border-none">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-zinc-400">
                        <Info size={16} /> Análise de Saúde (IA)
                    </h3>

                    {analyzing ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="animate-spin text-zinc-500" size={32} />
                            <p className="text-xs text-zinc-500 animate-pulse">Consultando Gemini AI...</p>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge variant={analysis.status}>{analysis.status}</Badge>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Diagnóstico</div>
                                <p className="text-sm leading-relaxed">{analysis.reason}</p>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Recomendação</div>
                                <p className="text-sm text-emerald-400 font-medium">{analysis.recommendation}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-xs text-zinc-500">Nenhuma análise disponível.</p>
                            <button
                                onClick={() => onAnalyze(product)}
                                className="mt-4 text-xs underline hover:text-white"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <h3 className="text-sm font-semibold mb-4">Ações Rápidas</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left p-3 rounded-lg border border-zinc-100 text-sm hover:bg-zinc-50 transition-colors flex justify-between items-center">
                            Ajustar Preço no WP <ChevronRight size={14} />
                        </button>
                        <button className="w-full text-left p-3 rounded-lg border border-zinc-100 text-sm hover:bg-zinc-50 transition-colors flex justify-between items-center">
                            Ver Pedidos Recentes <ChevronRight size={14} />
                        </button>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};
