import express from "express";
import { config as serverConfig } from "./config";
import {
    initDb,
    getStoreConfig,
    saveStoreConfig,
    getProductCosts,
    updateProductCost,
    upsertProductsCache,
    upsertOrdersCache,
    getCachedProducts,
    getCachedOrders,
    getLastProductSyncDate,
    getLastOrderSyncDate
} from "./db";
import { WooCommerceService } from "./services/woocommerce";
import { analyzeProductHealth } from "../src/services/geminiService";
import * as XLSX from "xlsx";
import multer from "multer";

const upload = multer({ dest: "/tmp" });

// Initialize Database
initDb();

const app = express();
app.use(express.json());

const syncClients: any[] = [];

app.get("/api/config", async (req, res) => {
    const config = await getStoreConfig();
    res.json(config || null);
});

app.post("/api/config", async (req, res) => {
    await saveStoreConfig(req.body);
    res.json({ success: true });
});

app.get("/api/sync/progress", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const client = { id: Date.now(), res };
    syncClients.push(client);

    req.on("close", () => {
        const index = syncClients.findIndex(c => c.id === client.id);
        if (index !== -1) syncClients.splice(index, 1);
    });
});

const broadcastSyncProgress = (msg: string) => {
    syncClients.forEach(client => client.res.write(`data: ${JSON.stringify({ message: msg })}\n\n`));
};

app.post("/api/sync", async (req, res) => {
    const config = await getStoreConfig() as any;
    if (!config) return res.status(400).json({ error: "Store not configured" });

    const { force } = req.body || {};

    try {
        const wcService = new WooCommerceService(config);

        let options = {};
        if (!force) {
            options = {
                modifiedAfterProducts: await getLastProductSyncDate(),
                modifiedAfterOrders: await getLastOrderSyncDate(),
            };
        }

        console.log("Starting sync with options:", options);
        const { products, orders } = await wcService.syncAll((msg) => {
            console.log(`[Sync] ${msg}`);
            broadcastSyncProgress(msg);
        }, options);

        if (products.length > 0) await upsertProductsCache(products);
        if (orders.length > 0) await upsertOrdersCache(orders);

        res.json({ success: true, productsCount: products.length, ordersCount: orders.length });
    } catch (error: any) {
        console.error("Sync Error:", error.message);
        const detail = error.response?.data?.message || error.message;
        res.status(500).json({ error: detail || "Failed to sync data" });
    }
});

app.get("/api/orders", async (req, res) => {
    try {
        const cachedOrders = await getCachedOrders() as any[];

        const config = await getStoreConfig() as any;
        const costs = await getProductCosts() as any[];
        const costMap = new Map((costs || []).map((c) => [c.product_id, c.cost]));

        const orders = cachedOrders.map((order: any) => {
            const lineItems = JSON.parse(order.line_items_json || "[]");
            let totalCost = 0;
            lineItems.forEach((item: any) => {
                const unitCost = costMap.get(item.product_id) || 0;
                totalCost += unitCost * item.quantity;
            });

            const subtotal = parseFloat(order.total || "0");
            const taxes = subtotal * ((config?.tax_rate || 0) / 100);
            const gatewayFees = subtotal * ((config?.gateway_fee || 0) / 100) + (config?.fixed_fee || 0);
            const profit = subtotal - totalCost - taxes - gatewayFees;

            return {
                id: order.id,
                number: order.number,
                status: order.status,
                date_created: order.date_created,
                total: order.total || "0",
                customer_name: order.customer_name || "N/A",
                customer_email: order.customer_email || "N/A",
                customer_phone: order.customer_phone || "N/A",
                total_cost: totalCost || 0,
                taxes: taxes || 0,
                gatewayFees: gatewayFees || 0,
                profit: profit || 0,
                items_count: lineItems.length || 0
            };
        });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch orders" });
    }
});

app.get("/api/products", async (req, res) => {
    try {
        const cachedProducts = await getCachedProducts() as any[];

        const { page = 1, per_page = 20 } = req.query;
        const start = (Number(page) - 1) * Number(per_page);
        const end = start + Number(per_page);

        const products = cachedProducts.slice(start, end).map((p: any) => ({
            ...p,
            images: JSON.parse(p.images_json || "[]"),
            cost: p.cost || 0,
        }));

        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch products" });
    }
});

app.post("/api/products/:id/cost", async (req, res) => {
    const { id } = req.params;
    const { cost } = req.body;
    await updateProductCost(id, cost);
    res.json({ success: true });
});

app.post("/api/products/:id/analyze", async (req, res) => {
    const { productName, price, cost, margin, markup } = req.body;
    try {
        const analysis = await analyzeProductHealth(productName, price, cost, margin, markup);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: "AI Analysis failed" });
    }
});

app.get("/api/export/products", async (req, res) => {
    try {
        const products = await getCachedProducts();
        const exportData = products.map((p: any) => ({
            "ID": p.id,
            "Nome do Produto": p.name,
            "SKU": p.sku || "-",
            "Preço (R$)": p.price ? parseFloat(p.price) : 0,
            "Custo (R$)": p.cost || 0,
            "Estoque": p.stock_quantity || 0,
            "Categorias": Array.isArray(p.categories) ? p.categories.map((c: any) => c.name).join(", ") : ""
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Produtos");
        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `Catalogo_CS_Sale_Produtos_${dateStr}.xlsx`;

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buf);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/export/orders", async (req, res) => {
    try {
        const orders = await getCachedOrders();
        const exportData = orders.map((o: any) => ({
            "ID Pedido": o.id,
            "Número": o.number,
            "Status": o.status,
            "Data": new Date(o.date_created).toLocaleDateString('pt-BR'),
            "Cliente": o.customer_name || "N/A",
            "E-mail": o.customer_email || "N/A",
            "Total (R$)": parseFloat(o.total) || 0,
            "Lucro (R$)": o.profit || 0
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `Relatorio_CS_Sale_Pedidos_${dateStr}.xlsx`;

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buf);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/import/costs", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet) as any[];

        let count = 0;
        for (const row of data) {
            const id = row.id || row.product_id || row.ID;
            const cost = row.cost || row.custo || row.Custo;

            if (id && cost !== undefined) {
                await updateProductCost(id, parseFloat(cost));
                count++;
            }
        }

        res.json({ success: true, count });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default app;
