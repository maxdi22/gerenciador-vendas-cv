import React from "react";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { Card } from "../ui/Card";
import { StoreConfig } from "../../types";

interface ConfigViewProps {
    config: StoreConfig | null;
    saveConfig: (data: any) => Promise<void>;
}

export const ConfigView = ({ config, saveConfig }: ConfigViewProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <Card className="max-w-xl mx-auto p-8">
                <h2 className="text-lg font-medium mb-6">Configuração da Loja</h2>
                <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data = Object.fromEntries(formData.entries());
                        await saveConfig(data);
                    }}
                >
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">URL da Loja</label>
                        <input name="url" defaultValue={config?.url} placeholder="https://loja.com" className="w-full p-2 border border-zinc-200 rounded-lg text-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Consumer Key</label>
                        <input name="consumer_key" defaultValue={config?.consumer_key} className="w-full p-2 border border-zinc-200 rounded-lg text-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Consumer Secret</label>
                        <input name="consumer_secret" type="password" defaultValue={config?.consumer_secret} className="w-full p-2 border border-zinc-200 rounded-lg text-sm" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Imposto (%)</label>
                            <input name="tax_rate" type="number" step="0.01" defaultValue={config?.tax_rate} className="w-full p-2 border border-zinc-200 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Taxa Cartão (%)</label>
                            <input name="gateway_fee" type="number" step="0.01" defaultValue={config?.gateway_fee} className="w-full p-2 border border-zinc-200 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Taxa Fixa (R$)</label>
                            <input name="fixed_fee" type="number" step="0.01" defaultValue={config?.fixed_fee} className="w-full p-2 border border-zinc-200 rounded-lg text-sm" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-zinc-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                        <Save size={16} /> Salvar Configurações
                    </button>
                </form>
            </Card>
        </motion.div>
    );
};
