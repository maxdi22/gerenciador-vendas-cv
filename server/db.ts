import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  console.warn("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.");
}

export const supabase = createClient(
  config.SUPABASE_URL || "https://placeholder.supabase.co",
  config.SUPABASE_ANON_KEY || "placeholder_key"
);

export async function initDb() {
  // No-op for Supabase as tables are created via migrations
  return Promise.resolve();
}

export async function getStoreConfig() {
  const { data, error } = await supabase
    .from("sale_store_config")
    .select("*")
    .eq("id", 1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching config:", error);
  }
  return data || null;
}

export async function saveStoreConfig(storeConfig: any) {
  const { error } = await supabase
    .from("sale_store_config")
    .upsert({
      id: 1,
      url: storeConfig.url || "",
      consumer_key: storeConfig.consumer_key || "",
      consumer_secret: storeConfig.consumer_secret || "",
      tax_rate: storeConfig.tax_rate || 0,
      gateway_fee: storeConfig.gateway_fee || 0,
      fixed_fee: storeConfig.fixed_fee || 0
    });

  if (error) {
    console.error("Error saving config:", error);
    throw new Error(error.message);
  }
}

export async function getProductCosts() {
  const { data, error } = await supabase
    .from("sale_product_costs")
    .select("*");

  if (error) console.error("Error fetching product costs:", error);
  return data || [];
}

export async function updateProductCost(productId: number | string, cost: number) {
  const { error } = await supabase
    .from("sale_product_costs")
    .upsert({ product_id: Number(productId), cost });

  if (error) console.error("Error updating product cost:", error);
}

export async function upsertProductsCache(products: any[]) {
  if (!products || products.length === 0) return;

  const rows = products.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    regular_price: item.regular_price,
    sale_price: item.sale_price,
    images_json: JSON.stringify(item.images || []),
    permalink: item.permalink
  }));

  const { error } = await supabase
    .from("sale_products_cache")
    .upsert(rows);

  if (error) console.error("Error upserting products cache:", error);
}

export async function upsertOrdersCache(orders: any[]) {
  if (!orders || orders.length === 0) return;

  const rows = orders.map((order) => {
    let customerPhone = order.billing?.phone || "";
    // format date as ISO
    let date_created = order.date_created;
    if (date_created?.includes("T")) date_created = date_created.replace("T", " ");

    return {
      id: order.id,
      number: order.number,
      status: order.status,
      date_created: date_created,
      total: order.total,
      customer_name: `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim(),
      customer_email: order.billing?.email || "",
      customer_phone: customerPhone,
      line_items_json: JSON.stringify(order.line_items || [])
    };
  });

  const { error } = await supabase
    .from("sale_orders_cache")
    .upsert(rows);

  if (error) console.error("Error upserting orders cache:", error);
}

export async function getCachedProducts() {
  const { data: products, error: pError } = await supabase
    .from("sale_products_cache")
    .select("*");

  const { data: costs, error: cError } = await supabase
    .from("sale_product_costs")
    .select("*");

  if (pError || cError) {
    console.error("Error fetching cached products:", pError || cError);
    return [];
  }

  const costMap = new Map((costs || []).map(c => [c.product_id, c.cost]));

  return (products || []).map(p => ({
    ...p,
    cost: costMap.get(p.id) || 0
  }));
}

export async function getCachedOrders() {
  const { data, error } = await supabase
    .from("sale_orders_cache")
    .select("*")
    .order("date_created", { ascending: false });

  if (error) {
    console.error("Error fetching cached orders:", error);
    return [];
  }
  return data || [];
}

export async function clearCache() {
  await supabase.from("sale_products_cache").delete().neq("id", 0);
  await supabase.from("sale_orders_cache").delete().neq("id", 0);
}

export async function getLastProductSyncDate(): Promise<string | null> {
  const { data, error } = await supabase
    .from("sale_products_cache")
    .select("last_sync")
    .order("last_sync", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error getting last product sync:", error);
  }
  return data?.last_sync || null;
}

export async function getLastOrderSyncDate(): Promise<string | null> {
  const { data, error } = await supabase
    .from("sale_orders_cache")
    .select("last_sync")
    .order("last_sync", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error getting last order sync:", error);
  }
  return data?.last_sync || null;
}
