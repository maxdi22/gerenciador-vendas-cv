import axios from "axios";

export class WooCommerceService {
    private url: string;
    private consumerKey: string;
    private consumerSecret: string;

    constructor(config: { url: string; consumer_key: string; consumer_secret: string }) {
        let cleanUrl = config.url.trim().replace(/\/+$/, "");
        if (!cleanUrl.startsWith("http")) {
            cleanUrl = `https://${cleanUrl}`;
        }
        this.url = cleanUrl;
        this.consumerKey = config.consumer_key;
        this.consumerSecret = config.consumer_secret;
    }

    private get auth() {
        return {
            username: this.consumerKey,
            password: this.consumerSecret,
        };
    }

    async getOrders(params = {}) {
        try {
            const response = await axios.get(`${this.url}/wp-json/wc/v3/orders`, {
                params: {
                    per_page: 50,
                    status: 'processing,on-hold,completed',
                    ...params
                },
                auth: this.auth,
            });
            return response.data;
        } catch (error: any) {
            console.error("WooCommerce Orders Error:", error.response?.data || error.message);
            throw new Error("Failed to fetch orders from WooCommerce");
        }
    }

    async getProducts(params = {}) {
        try {
            const response = await axios.get(`${this.url}/wp-json/wc/v3/products`, {
                params,
                auth: this.auth,
            });
            return response.data;
        } catch (error: any) {
            console.error("WooCommerce Products Error:", error.response?.data || error.message);
            throw new Error("Failed to fetch products from WooCommerce");
        }
    }

    async syncAll(
        onProgress: (msg: string) => void,
        options?: { modifiedAfterProducts?: string | null, modifiedAfterOrders?: string | null }
    ) {
        onProgress("Iniciando sincronização de produtos...");
        let page = 1;
        let products = [];
        const productParams: any = { per_page: 100 };
        if (options?.modifiedAfterProducts) productParams.modified_after = options.modifiedAfterProducts;

        while (true) {
            const chunk = await this.getProducts({ page, ...productParams });
            if (!chunk || chunk.length === 0) break;
            products.push(...chunk);
            onProgress(`Baixados ${products.length} produtos...`);
            page++;
        }

        onProgress("Iniciando sincronização de pedidos...");
        page = 1;
        let orders = [];
        const orderParams: any = { per_page: 100 };
        if (options?.modifiedAfterOrders) orderParams.modified_after = options.modifiedAfterOrders;

        while (true) {
            const chunk = await this.getOrders({ page, ...orderParams });
            if (!chunk || chunk.length === 0) break;
            orders.push(...chunk);
            onProgress(`Baixados ${orders.length} pedidos...`);
            page++;
        }

        return { products, orders };
    }
}
