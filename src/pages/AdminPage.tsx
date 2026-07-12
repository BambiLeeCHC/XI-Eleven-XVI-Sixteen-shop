import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { format } from "date-fns";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Mail,
  MessageSquare,
  Settings,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Tag,
  Phone,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  UserCheck,
  X,
  Receipt,
  Globe,
  ToggleLeft,
  ToggleRight,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────

type AdminTab =
  | "dashboard"
  | "orders"
  | "products"
  | "customers"
  | "crm"
  | "newsletter"
  | "shipping"
  | "tax"
  | "settings";

interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  email: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  currency: string;
  items: Array<{
    productId: Id<"products">;
    productName: string;
    size: string;
    quantity: number;
    priceAtPurchase: number;
    image?: string;
  }>;
  shippingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    stateCode: string;
    countryCode: string;
    zip: string;
    phone?: string;
  };
  trackingUrl?: string;
  trackingNumber?: string;
  stripeCheckoutSessionId?: string;
  printfulOrderId?: string;
}

// ─── Sidebar ────────────────────────────────────────────────────────────

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: any }> = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "crm", label: "CRM", icon: MessageSquare },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "tax", label: "Tax Rates", icon: Receipt },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({
  active,
  onSelect,
}: {
  active: AdminTab;
  onSelect: (tab: AdminTab) => void;
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-white/[0.06] bg-[#0c0c0c] min-h-screen">
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500/20 flex items-center justify-center">
            <Settings className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-medium tracking-wide text-white/90">
            Admin
          </span>
        </div>
      </div>
      <nav className="p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {isActive && (
                <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color = "amber",
}: {
  label: string;
  value: string;
  icon: any;
  color?: string;
}) {
  const colors: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-400",
    green: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    rose: "bg-rose-500/10 text-rose-400",
  };
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] tracking-wider uppercase text-white/40">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-xl font-semibold text-white/90">{value}</div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    paid: "bg-green-500/10 text-green-400 border-green-500/20",
    fulfilled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
        styles[status] || "bg-white/5 text-white/50 border-white/10"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Dashboard Tab ──────────────────────────────────────────────────────

const CHART_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

function DashboardTab() {
  const stats = useQuery(api.admin.dashboardStats);
  if (!stats) return <LoadingState />;

  const revenueData = Object.entries(stats.revenueByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date: format(new Date(date), "MMM d"),
      revenue: (revenue as number) / 100,
    }));

  const categoryData = Object.entries(stats.categoryRevenue).map(
    ([name, revenue]) => ({
      name,
      value: (revenue as number) / 100,
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium text-white/90">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${(stats.totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          label="Avg Order Value"
          value={`$${(stats.avgOrderValue / 100).toFixed(2)}`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers.toString()}
          icon={Users}
          color="amber"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Products"
          value={`${stats.activeProducts} / ${stats.totalProducts}`}
          icon={Package}
          color="amber"
        />
        <StatCard
          label="Newsletter"
          value={stats.newsletterSubscribers.toString()}
          icon={Mail}
          color="rose"
        />
        <StatCard
          label="Paid Orders"
          value={stats.paidOrders.toString()}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Pending"
          value={(stats.ordersByStatus?.pending || 0).toString()}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <h3 className="text-[11px] tracking-wider uppercase text-white/40 mb-4">
            Revenue (Last 30 Days)
          </h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-white/20 text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Category Pie */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <h3 className="text-[11px] tracking-wider uppercase text-white/40 mb-4">
            Revenue by Category
          </h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {categoryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#fff",
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-white/50">{d.name}</span>
                    <span className="ml-auto text-white/70">
                      ${d.value.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <h3 className="text-[11px] tracking-wider uppercase text-white/40 mb-3">
            Top Products
          </h3>
          <div className="space-y-2">
            {stats.topProducts.map((p: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white/20 text-xs w-4">{i + 1}</span>
                  <span className="text-sm text-white/70">{p.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40">
                    {p.units} units
                  </span>
                  <span className="text-sm font-medium text-white/80">
                    ${(p.revenue / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ─────────────────────────────────────────────────────────

function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const orders = useQuery(api.admin.listOrders, statusFilter ? { status: statusFilter } : {});
  const updateStatus = useMutation(api.admin.updateOrderStatus);

  if (!orders) return <LoadingState />;

  const filtered = search
    ? orders.filter(
        (o: any) =>
          o.email?.toLowerCase().includes(search.toLowerCase()) ||
          o._id.includes(search) ||
          o.items?.some((i: any) =>
            i.productName?.toLowerCase().includes(search.toLowerCase())
          )
      )
    : orders;

  const statuses = ["", "pending", "paid", "fulfilled", "shipped", "delivered", "cancelled"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-white/90">Orders</h1>
        <span className="text-xs text-white/30">{orders.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search by email, order ID, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-2">
          <Filter className="w-3.5 h-3.5 text-white/20" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-white/60 py-2 pr-2 focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s} className="bg-[#1a1a1a]">
                {s || "All statuses"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Order List */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Date", "Customer", "Items", "Total", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] tracking-wider uppercase text-white/30 font-medium"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/20 text-sm">
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((order: any) => (
                <tr
                  key={order._id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-white/50">
                    {format(new Date(order._creationTime), "MMM d, yyyy")}
                    <br />
                    <span className="text-white/25">
                      {format(new Date(order._creationTime), "h:mm a")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white/70">{order.email}</div>
                    <div className="text-[11px] text-white/25">
                      {order.shippingAddress?.name || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {order.items?.length || 0} item
                    {(order.items?.length || 0) !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white/80">
                    ${(order.total / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-white/30 hover:text-white/70 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={async (status, tracking) => {
            await updateStatus({
              orderId: selectedOrder._id,
              status,
              trackingUrl: tracking?.url,
              trackingNumber: tracking?.number,
            });
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (
    status: string,
    tracking?: { url?: string; number?: string }
  ) => Promise<void>;
}) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || ""
  );
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/[0.08] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-medium text-white/90">Order Details</h2>
            <p className="text-[11px] text-white/30 mt-0.5 font-mono">
              {order._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-wider uppercase text-white/30">
                Customer
              </label>
              <p className="text-sm text-white/80 mt-1">{order.email}</p>
            </div>
            <div>
              <label className="text-[10px] tracking-wider uppercase text-white/30">
                Date
              </label>
              <p className="text-sm text-white/80 mt-1">
                {format(new Date(order._creationTime), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="text-[10px] tracking-wider uppercase text-white/30">
              Items
            </label>
            <div className="mt-2 space-y-2">
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/[0.03] rounded-md p-2.5"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70 truncate">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-white/30">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-white/60">
                    ${((item.priceAtPurchase * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white/[0.03] rounded-md p-3 space-y-1.5">
            <div className="flex justify-between text-xs text-white/40">
              <span>Subtotal</span>
              <span>${(order.subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>Shipping</span>
              <span>${(order.shipping / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-white/80 pt-1.5 border-t border-white/[0.06]">
              <span>Total</span>
              <span>${(order.total / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <label className="text-[10px] tracking-wider uppercase text-white/30">
                Shipping Address
              </label>
              <div className="mt-1 text-sm text-white/60 leading-relaxed">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.stateCode}{" "}
                  {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.countryCode}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-1 text-white/40">
                    📞 {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* IDs */}
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            {order.stripeCheckoutSessionId && (
              <div>
                <span className="text-white/25">Stripe Session:</span>{" "}
                <span className="text-white/50 font-mono break-all">
                  {order.stripeCheckoutSessionId}
                </span>
              </div>
            )}
            {order.printfulOrderId && (
              <div>
                <span className="text-white/25">Printful Order:</span>{" "}
                <span className="text-white/50 font-mono">
                  {order.printfulOrderId}
                </span>
              </div>
            )}
          </div>

          {/* Update Status */}
          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            <label className="text-[10px] tracking-wider uppercase text-white/30">
              Update Order
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/25 mb-1 block">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/70 focus:outline-none"
                >
                  {[
                    "pending",
                    "paid",
                    "fulfilled",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((s) => (
                    <option key={s} value={s} className="bg-[#1a1a1a]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/25 mb-1 block">
                  Fulfillment Stage
                </label>
                <select
                  value={newStatus === "paid" ? "payment_received" : newStatus === "fulfilled" ? "printful_fulfilled" : newStatus === "shipped" ? "shipped" : newStatus === "delivered" ? "delivered" : "payment_received"}
                  onChange={(e) => {
                    const stage = e.target.value;
                    if (stage === "shipped") setNewStatus("shipped");
                    else if (stage === "delivered") setNewStatus("delivered");
                    else if (stage === "printful_fulfilled" || stage === "printful_processing") setNewStatus("fulfilled");
                    else setNewStatus("paid");
                  }}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/70 focus:outline-none"
                >
                  <option value="payment_received" className="bg-[#1a1a1a]">Payment Received</option>
                  <option value="sent_to_printful" className="bg-[#1a1a1a]">Sent to Production</option>
                  <option value="printful_processing" className="bg-[#1a1a1a]">Being Crafted</option>
                  <option value="printful_fulfilled" className="bg-[#1a1a1a]">Production Complete</option>
                  <option value="shipped" className="bg-[#1a1a1a]">Shipped</option>
                  <option value="delivered" className="bg-[#1a1a1a]">Delivered</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/25 mb-1 block">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/70 placeholder-white/15 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/25 mb-1 block">
                  Carrier
                </label>
                <input
                  type="text"
                  placeholder="e.g. USPS, FedEx"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/70 placeholder-white/15 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/25 mb-1 block">
                Tracking URL
              </label>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/70 placeholder-white/15 focus:outline-none"
              />
            </div>
            <button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onUpdateStatus(newStatus, {
                  url: trackingUrl || undefined,
                  number: trackingNumber || undefined,
                });
                setSaving(false);
              }}
              className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-md text-sm hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ───────────────────────────────────────────────────────

function ProductsTab() {
  const products = useQuery(api.admin.listAllProducts);
  const updateProduct = useMutation(api.admin.updateProduct);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  if (!products) return <LoadingState />;

  const sorted = [...products].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  const filtered = search
    ? sorted.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : sorted;

  const startEdit = (product: any) => {
    setEditingId(product._id);
    setEditForm({
      name: product.name,
      description: product.description,
      price: (product.price / 100).toFixed(2),
      category: product.category,
      gender: product.gender,
      isActive: product.isActive,
    });
  };

  const saveEdit = async (productId: Id<"products">) => {
    await updateProduct({
      productId,
      name: editForm.name,
      description: editForm.description,
      price: Math.round(parseFloat(editForm.price) * 100),
      category: editForm.category,
      gender: editForm.gender,
      isActive: editForm.isActive,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-white/90">Products</h1>
        <span className="text-xs text-white/30">
          {products.filter((p: any) => p.isActive).length} active /{" "}
          {products.length} total
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((product: any) => (
          <div
            key={product._id}
            className={`bg-white/[0.03] border rounded-lg overflow-hidden transition-colors ${
              product.isActive
                ? "border-white/[0.06]"
                : "border-red-500/20 opacity-60"
            }`}
          >
            {editingId === product._id ? (
              /* Edit Mode */
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/25 block mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-1.5 text-sm text-white/80 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-white/25 block mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-1.5 text-sm text-white/80 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/25 block mb-1">
                        Category
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-sm text-white/70 focus:outline-none"
                      >
                        {["Tops", "Bottoms", "Dresses", "Activewear"].map(
                          (c) => (
                            <option key={c} value={c} className="bg-[#1a1a1a]">
                              {c}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/25 block mb-1">
                        Gender
                      </label>
                      <select
                        value={editForm.gender}
                        onChange={(e) =>
                          setEditForm({ ...editForm, gender: e.target.value })
                        }
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-sm text-white/70 focus:outline-none"
                      >
                        {["men", "women", "unisex"].map((g) => (
                          <option key={g} value={g} className="bg-[#1a1a1a]">
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/25 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-1.5 text-sm text-white/80 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(product._id)}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-500/30"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex items-center gap-4 p-3">
                <img
                  src={product.images?.[0]}
                  alt=""
                  className="w-12 h-12 rounded object-cover bg-white/5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white/80 truncate">
                      {product.name}
                    </p>
                    {!product.isActive && (
                      <span className="text-[9px] uppercase tracking-wider text-red-400/70 bg-red-500/10 px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/30">
                    {product.category} · {product.gender} ·{" "}
                    {product.sizes?.length || 0} sizes ·{" "}
                    {product.images?.length || 0} images
                  </p>
                </div>
                <span className="text-sm font-medium text-white/70 tabular-nums">
                  ${(product.price / 100).toFixed(2)}
                </span>
                <button
                  onClick={() => startEdit(product)}
                  className="text-white/20 hover:text-white/60 transition-colors p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Customers Tab ──────────────────────────────────────────────────────

function CustomersTab({
  onSelectCustomer,
}: {
  onSelectCustomer: (id: string) => void;
}) {
  const customers = useQuery(api.admin.listCustomers);
  const [search, setSearch] = useState("");

  if (!customers) return <LoadingState />;

  const filtered = search
    ? customers.filter(
        (c: any) =>
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.name?.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-white/90">Customers</h1>
        <span className="text-xs text-white/30">{customers.length} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20"
        />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Customer", "Role", "Orders", "Total Spent", "Last Order", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] tracking-wider uppercase text-white/30 font-medium"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/20 text-sm">
                  No customers yet
                </td>
              </tr>
            ) : (
              filtered.map((customer: any) => (
                <tr
                  key={customer._id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-xs text-white/40">
                        {(customer.name || customer.email || "?")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white/70">
                          {customer.name || "—"}
                        </p>
                        <p className="text-[11px] text-white/30">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        customer.role === "admin"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-white/5 text-white/30 border border-white/10"
                      }`}
                    >
                      {customer.role || "customer"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">
                    {customer.orderCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">
                    ${(customer.totalSpent / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">
                    {customer.lastOrderDate
                      ? format(new Date(customer.lastOrderDate), "MMM d, yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectCustomer(customer._id)}
                      className="text-white/30 hover:text-amber-400 transition-colors text-xs"
                    >
                      CRM →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CRM Tab ────────────────────────────────────────────────────────────

function CrmTab({ preselectedCustomerId }: { preselectedCustomerId?: string }) {
  const customers = useQuery(api.admin.listCustomers);
  const [selectedId, setSelectedId] = useState<string | null>(
    preselectedCustomerId || null
  );

  if (!customers) return <LoadingState />;

  // Update if preselected changes
  if (preselectedCustomerId && preselectedCustomerId !== selectedId) {
    setSelectedId(preselectedCustomerId);
  }

  const selectedCustomer = customers.find((c: any) => c._id === selectedId);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium text-white/90">CRM</h1>

      <div className="grid grid-cols-3 gap-4">
        {/* Customer List */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg">
          <div className="p-3 border-b border-white/[0.06]">
            <p className="text-[11px] tracking-wider uppercase text-white/30">
              Customers
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {customers.map((c: any) => (
              <button
                key={c._id}
                onClick={() => setSelectedId(c._id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.04] text-left transition-colors ${
                  c._id === selectedId
                    ? "bg-white/[0.06]"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-white/40 shrink-0">
                  {(c.name || c.email || "?")[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/70 truncate">
                    {c.name || c.email || "Unknown"}
                  </p>
                  <p className="text-[10px] text-white/25 truncate">
                    {c.orderCount} orders · ${(c.totalSpent / 100).toFixed(0)}
                  </p>
                </div>
              </button>
            ))}
            {customers.length === 0 && (
              <p className="p-4 text-center text-white/20 text-xs">
                No customers yet
              </p>
            )}
          </div>
        </div>

        {/* Customer Detail + Notes */}
        <div className="col-span-2">
          {selectedCustomer ? (
            <CrmDetail customer={selectedCustomer} />
          ) : (
            <div className="h-full bg-white/[0.03] border border-white/[0.06] rounded-lg flex items-center justify-center">
              <p className="text-white/20 text-sm">
                Select a customer to view CRM details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CrmDetail({ customer }: { customer: any }) {
  const notes = useQuery(api.admin.listCrmNotes, {
    customerId: customer._id,
  });
  const profile = useQuery(api.admin.getCrmProfile, {
    customerId: customer._id,
  });
  const addNote = useMutation(api.admin.addCrmNote);
  const deleteNote = useMutation(api.admin.deleteCrmNote);
  const updateTags = useMutation(api.admin.updateCustomerTags);
  const setRole = useMutation(api.admin.setUserRole);

  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [newTag, setNewTag] = useState("");

  const NOTE_TYPES = [
    { id: "note", label: "Note", icon: FileText },
    { id: "call", label: "Call", icon: Phone },
    { id: "email", label: "Email", icon: Mail },
    { id: "issue", label: "Issue", icon: AlertCircle },
    { id: "follow_up", label: "Follow-up", icon: Clock },
  ];

  const tags = profile?.tags || [];

  return (
    <div className="space-y-4">
      {/* Customer Header */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-lg text-white/40">
              {(customer.name || customer.email || "?")[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-medium text-white/90">
                {customer.name || "Unknown"}
              </h2>
              <p className="text-xs text-white/40">{customer.email}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30">
                <span>{customer.orderCount} orders</span>
                <span>·</span>
                <span>
                  ${(customer.totalSpent / 100).toFixed(2)} lifetime
                </span>
                <span>·</span>
                <span>
                  Joined{" "}
                  {format(new Date(customer._creationTime), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setRole({
                  userId: customer._id,
                  role: customer.role === "admin" ? "customer" : "admin",
                })
              }
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                customer.role === "admin"
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-white/5 text-white/30 hover:bg-white/10"
              }`}
            >
              {customer.role === "admin" ? "Remove Admin" : "Make Admin"}
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.06] rounded-full text-[10px] text-white/50"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
              <button
                onClick={() =>
                  updateTags({
                    customerId: customer._id,
                    tags: tags.filter((_: any, j: number) => j !== i),
                  })
                }
                className="ml-0.5 text-white/20 hover:text-white/50"
              >
                ×
              </button>
            </span>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTag.trim()) {
                updateTags({
                  customerId: customer._id,
                  tags: [...tags, newTag.trim()],
                });
                setNewTag("");
              }
            }}
            className="flex items-center"
          >
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="+ Add tag"
              className="bg-transparent text-[10px] text-white/40 placeholder-white/15 w-16 focus:w-24 focus:outline-none transition-all"
            />
          </form>
        </div>
      </div>

      {/* Add Note */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
        <div className="flex gap-2 mb-2">
          {NOTE_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setNoteType(t.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                  noteType === t.id
                    ? "bg-white/[0.08] text-white/70"
                    : "text-white/25 hover:text-white/50"
                }`}
              >
                <Icon className="w-3 h-3" />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this customer..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/70 placeholder-white/15 focus:outline-none resize-none"
          />
          <button
            disabled={!newNote.trim()}
            onClick={async () => {
              if (newNote.trim()) {
                await addNote({
                  customerId: customer._id,
                  note: newNote.trim(),
                  type: noteType,
                });
                setNewNote("");
              }
            }}
            className="px-3 self-end bg-amber-500/20 text-amber-400 rounded-md text-xs hover:bg-amber-500/30 transition-colors disabled:opacity-30 h-8"
          >
            Add
          </button>
        </div>
      </div>

      {/* Notes Timeline */}
      <div className="space-y-2">
        <h3 className="text-[11px] tracking-wider uppercase text-white/30">
          Activity ({notes?.length || 0})
        </h3>
        {notes?.map((note: any) => {
          const typeInfo = NOTE_TYPES.find((t) => t.id === note.type) || NOTE_TYPES[0];
          const Icon = typeInfo.icon;
          return (
            <div
              key={note._id}
              className="flex gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3"
            >
              <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-white/30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-medium text-white/50">
                    {typeInfo.label}
                  </span>
                  <span className="text-[10px] text-white/20">
                    by {note.adminName}
                  </span>
                  <span className="text-[10px] text-white/15 ml-auto">
                    {format(new Date(note.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-xs text-white/60 whitespace-pre-wrap">
                  {note.note}
                </p>
              </div>
              <button
                onClick={() => deleteNote({ noteId: note._id })}
                className="text-white/10 hover:text-red-400 transition-colors self-start"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        {(!notes || notes.length === 0) && (
          <p className="text-center text-white/15 text-xs py-6">
            No notes yet — add one above
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Newsletter Tab ─────────────────────────────────────────────────────

function NewsletterTab() {
  const subscribers = useQuery(api.admin.listSubscribers);
  const removeSubscriber = useMutation(api.admin.removeSubscriber);
  const [search, setSearch] = useState("");

  if (!subscribers) return <LoadingState />;

  const filtered = search
    ? subscribers.filter((s: any) =>
        s.email.toLowerCase().includes(search.toLowerCase())
      )
    : subscribers;

  const handleExport = () => {
    const csv =
      "email,subscribed_at\n" +
      subscribers
        .map(
          (s: any) =>
            `${s.email},${new Date(s.subscribedAt).toISOString()}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-white/90">
          Newsletter Subscribers
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">
            {subscribers.length} subscribers
          </span>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-white/[0.06] rounded-md text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text"
          placeholder="Search subscribers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20"
        />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-2.5 text-left text-[10px] tracking-wider uppercase text-white/30 font-medium">
                Email
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] tracking-wider uppercase text-white/30 font-medium">
                Subscribed
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] tracking-wider uppercase text-white/30 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub: any) => (
              <tr
                key={sub._id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02]"
              >
                <td className="px-4 py-2.5 text-sm text-white/70">
                  {sub.email}
                </td>
                <td className="px-4 py-2.5 text-xs text-white/40">
                  {format(new Date(sub.subscribedAt), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => removeSubscriber({ subscriberId: sub._id })}
                    className="text-white/15 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────────────────

function SettingsTab() {
  const customers = useQuery(api.admin.listCustomers);
  const setRole = useMutation(api.admin.setUserRole);

  const [search, setSearch] = useState("");
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [confirmGrant, setConfirmGrant] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const admins = customers?.filter((c: any) => c.role === "admin") || [];
  const nonAdmins = customers?.filter((c: any) => c.role !== "admin") || [];

  // Filter non-admins by search
  const filteredNonAdmins = nonAdmins.filter((c: any) => {
    if (!search.trim()) return false; // Only show when searching
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const handleGrantAdmin = async (userId: string) => {
    setSaving(true);
    try {
      await setRole({ userId: userId as Id<"users">, role: "admin" });
      setConfirmGrant(null);
      setSearch("");
      setShowAddAdmin(false);
    } catch (e) {
      console.error("Failed to grant admin:", e);
    }
    setSaving(false);
  };

  const handleRevokeAdmin = async (userId: string) => {
    setSaving(true);
    try {
      await setRole({ userId: userId as Id<"users">, role: "customer" });
      setConfirmRemove(null);
    } catch (e) {
      console.error("Failed to revoke admin:", e);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium text-white/90">Settings</h1>

      {/* ── Admin Privilege Management ─────────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400/60" />
            <h3 className="text-[11px] tracking-wider uppercase text-white/30">
              Admin Privileges
            </h3>
          </div>
          <button
            onClick={() => { setShowAddAdmin(!showAddAdmin); setSearch(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              showAddAdmin
                ? "bg-white/[0.08] text-white/60"
                : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
            }`}
          >
            {showAddAdmin ? (
              <>
                <X className="w-3 h-3" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                Add Admin
              </>
            )}
          </button>
        </div>

        {/* Current Admins */}
        <div className="space-y-1">
          {admins.length === 0 && (
            <p className="text-xs text-white/20 py-2">No admin users</p>
          )}
          {admins.map((admin: any) => (
            <div
              key={admin._id}
              className="flex items-center justify-between py-2.5 px-3 rounded-md bg-white/[0.02] border border-white/[0.04] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-medium text-amber-400/70">
                  {(admin.name || admin.email || "?")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white/80">{admin.name || "—"}</p>
                  <p className="text-[11px] text-white/30">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium tracking-wider uppercase text-amber-400/50 bg-amber-500/10 px-2 py-0.5 rounded">
                  Admin
                </span>
                {confirmRemove === admin._id ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in">
                    <span className="text-[10px] text-red-400/60 mr-1">Remove?</span>
                    <button
                      disabled={saving}
                      onClick={() => handleRevokeAdmin(admin._id)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
                    >
                      {saving ? "..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmRemove(null)}
                      className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/30 hover:bg-white/10 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(admin._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded text-[10px] text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Admin Panel */}
        {showAddAdmin && (
          <div className="border border-amber-500/10 bg-amber-500/[0.03] rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2">
            <p className="text-xs text-white/40">
              Search registered users by name or email to grant admin privileges.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-500/30"
                autoFocus
              />
            </div>

            {/* Search Results */}
            {search.trim() && (
              <div className="max-h-56 overflow-y-auto space-y-1 rounded-md">
                {filteredNonAdmins.length === 0 ? (
                  <p className="text-xs text-white/20 text-center py-3">
                    No matching users found
                  </p>
                ) : (
                  filteredNonAdmins.map((user: any) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between py-2 px-3 rounded-md bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] text-white/40">
                          {(user.name || user.email || "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white/70">
                            {user.name || "—"}
                          </p>
                          <p className="text-[10px] text-white/30">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {confirmGrant === user._id ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in">
                          <span className="text-[10px] text-amber-400/60 mr-1">Grant admin?</span>
                          <button
                            disabled={saving}
                            onClick={() => handleGrantAdmin(user._id)}
                            className="px-2.5 py-1 rounded text-[10px] font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-40"
                          >
                            {saving ? "..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmGrant(null)}
                            className="px-2 py-1 rounded text-[10px] bg-white/5 text-white/30 hover:bg-white/10 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmGrant(user._id)}
                          className="px-3 py-1 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400/60 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                        >
                          Make Admin
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Store Info ─────────────────────────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 space-y-3">
        <h3 className="text-[11px] tracking-wider uppercase text-white/30">
          Store Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-[10px] text-white/25">Brand</label>
            <p className="text-white/60">XI Eleven XVI Sixteen</p>
          </div>
          <div>
            <label className="text-[10px] text-white/25">Contact</label>
            <p className="text-white/60">xixvi1116@icloud.com</p>
          </div>
          <div>
            <label className="text-[10px] text-white/25">Store URL</label>
            <p className="text-white/60 break-all">
              xi-xvi-store-b70b82f5.viktor.space
            </p>
          </div>
          <div>
            <label className="text-[10px] text-white/25">
              Printful Store ID
            </label>
            <p className="text-white/60">17855930</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shipping Tab ───────────────────────────────────────────────────────

const FULFILLMENT_STAGES = [
  { key: "payment_received", label: "Payment Received", color: "#f59e0b" },
  { key: "sent_to_printful", label: "Sent to Production", color: "#3b82f6" },
  { key: "printful_processing", label: "Being Crafted", color: "#8b5cf6" },
  { key: "printful_fulfilled", label: "Production Complete", color: "#10b981" },
  { key: "shipped", label: "Shipped", color: "#06b6d4" },
  { key: "delivered", label: "Delivered", color: "#22c55e" },
];

function ShippingTab() {
  const settings = useQuery(api.shipping.listSettings) ?? {};
  const upsertSetting = useMutation(api.shipping.upsertSetting);
  const orders = useQuery(api.orders.listAll) ?? [];
  const updateStatus = useMutation(api.orders.updateStatus);

  const [freeStandard, setFreeStandard] = useState<boolean>(true);
  const [showExpedited, setShowExpedited] = useState<boolean>(true);
  const [fulfillMin, setFulfillMin] = useState("2");
  const [fulfillMax, setFulfillMax] = useState("5");
  const [saved, setSaved] = useState(false);

  // Sync state from loaded settings
  useState(() => {
    if (settings.free_standard !== undefined) setFreeStandard(settings.free_standard === "true");
    if (settings.show_expedited !== undefined) setShowExpedited(settings.show_expedited === "true");
    if (settings.fulfillment_min_days) setFulfillMin(settings.fulfillment_min_days);
    if (settings.fulfillment_max_days) setFulfillMax(settings.fulfillment_max_days);
  });

  const handleSave = async () => {
    await upsertSetting({ key: "free_standard", value: String(freeStandard) });
    await upsertSetting({ key: "show_expedited", value: String(showExpedited) });
    await upsertSetting({ key: "fulfillment_min_days", value: fulfillMin });
    await upsertSetting({ key: "fulfillment_max_days", value: fulfillMax });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Orders with fulfillment stages
  const activeOrders = orders.filter((o: any) =>
    o.status === "paid" || o.status === "fulfilled" || o.status === "shipped"
  );

  const handleStageUpdate = async (orderId: string, stage: string) => {
    await updateStatus({
      orderId: orderId as any,
      status: stage === "shipped" ? "shipped" : stage === "delivered" ? "delivered" : "fulfilled",
      fulfillmentStage: stage,
    });
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl text-white font-semibold mb-6">Shipping & Fulfillment</h2>

      {/* Settings Card */}
      <div className="p-6 mb-8 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm text-white/70 uppercase tracking-wider mb-5">Shipping Settings</h3>

        <div className="space-y-4">
          {/* Free Standard */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white/80">Free Standard Shipping</p>
              <p className="text-xs text-white/30">Offer free standard shipping on all orders</p>
            </div>
            <button
              onClick={() => setFreeStandard(!freeStandard)}
              className="transition-colors"
              style={{ color: freeStandard ? "#10b981" : "rgba(255,255,255,0.3)" }}
            >
              {freeStandard ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>

          {/* Expedited Options */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white/80">Show Expedited Options</p>
              <p className="text-xs text-white/30">Display expedited shipping at checkout (from Printful rates)</p>
            </div>
            <button
              onClick={() => setShowExpedited(!showExpedited)}
              className="transition-colors"
              style={{ color: showExpedited ? "#10b981" : "rgba(255,255,255,0.3)" }}
            >
              {showExpedited ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>

          {/* Fulfillment Time */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white/80">Production Time (days)</p>
              <p className="text-xs text-white/30">Made-to-order production window</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={fulfillMin}
                onChange={(e) => setFulfillMin(e.target.value)}
                className="w-14 text-center text-sm rounded-lg py-1.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
              <span className="text-white/30 text-xs">to</span>
              <input
                type="number"
                value={fulfillMax}
                onChange={(e) => setFulfillMax(e.target.value)}
                className="w-14 text-center text-sm rounded-lg py-1.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 px-6 py-2.5 text-xs tracking-wider uppercase font-bold text-white rounded-lg transition-all"
          style={{
            background: saved
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "linear-gradient(135deg, #c48dff, #ff9eb8)",
          }}
        >
          {saved ? "✓ SAVED" : "SAVE SETTINGS"}
        </button>
      </div>

      {/* Active Orders / Fulfillment Tracker */}
      <div className="p-6 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm text-white/70 uppercase tracking-wider mb-5">
          Order Fulfillment ({activeOrders.length} active)
        </h3>

        {activeOrders.length === 0 ? (
          <p className="text-sm text-white/30 py-8 text-center">No active orders requiring fulfillment.</p>
        ) : (
          <div className="space-y-4">
            {activeOrders.slice(0, 20).map((order: any) => {
              const currentStageIdx = FULFILLMENT_STAGES.findIndex(s => s.key === order.fulfillmentStage);
              return (
                <div key={order._id} className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs text-white/40 font-mono">#{order._id.slice(-8)}</span>
                      <span className="text-xs text-white/30 ml-3">{order.email}</span>
                    </div>
                    <span className="text-xs text-white/50">
                      {format(new Date(order._creationTime), "MMM d, yyyy")}
                    </span>
                  </div>
                  {/* Stage progression */}
                  <div className="flex items-center gap-1 mb-2">
                    {FULFILLMENT_STAGES.map((stage, i) => (
                      <button
                        key={stage.key}
                        onClick={() => handleStageUpdate(order._id, stage.key)}
                        className="flex-1 h-2 rounded-full transition-all cursor-pointer hover:opacity-80"
                        title={`Set: ${stage.label}`}
                        style={{
                          background: i <= currentStageIdx
                            ? stage.color
                            : "rgba(255,255,255,0.06)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40">
                      {currentStageIdx >= 0 ? FULFILLMENT_STAGES[currentStageIdx].label : "Unknown"}
                    </span>
                    {order.printfulOrderId && (
                      <span className="text-[10px] text-purple-400/50">
                        Printful #{order.printfulOrderId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tax & Shipping Tab ─────────────────────────────────────────────────

function TaxTab() {
  const taxSettings = useQuery(api.tax.listSettings);
  const upsertRate = useMutation(api.tax.upsertRate);
  const deleteRate = useMutation(api.tax.deleteRate);
  const seedDefaults = useMutation(api.tax.seedDefaults);
  const [seeding, setSeeding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newRegion, setNewRegion] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newType, setNewType] = useState<"us_state" | "country">("us_state");
  const [filter, setFilter] = useState<"all" | "us_state" | "country">("all");

  const filteredSettings = (taxSettings || []).filter(
    (s: any) => filter === "all" || s.regionType === filter
  );

  const usStateCount = (taxSettings || []).filter((s: any) => s.regionType === "us_state").length;
  const countryCount = (taxSettings || []).filter((s: any) => s.regionType === "country").length;
  const enabledCount = (taxSettings || []).filter((s: any) => s.enabled).length;

  const handleSeed = async (type: string) => {
    setSeeding(true);
    try {
      await seedDefaults({ type });
    } catch (e) {
      console.error(e);
    }
    setSeeding(false);
  };

  const handleSaveEdit = async (setting: any) => {
    await upsertRate({
      region: setting.region,
      regionType: setting.regionType,
      label: setting.label,
      rate: parseFloat(editRate) / 100, // Convert percentage to decimal
      enabled: editEnabled,
    });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newRegion || !newLabel || !newRate) return;
    await upsertRate({
      region: newRegion.toUpperCase(),
      regionType: newType,
      label: newLabel,
      rate: parseFloat(newRate) / 100,
      enabled: true,
    });
    setNewRegion("");
    setNewLabel("");
    setNewRate("");
    setShowAdd(false);
  };

  const handleToggle = async (setting: any) => {
    await upsertRate({
      region: setting.region,
      regionType: setting.regionType,
      label: setting.label,
      rate: setting.rate,
      enabled: !setting.enabled,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-white/90">Tax & Shipping</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-wider uppercase bg-amber-500/10 text-amber-400/70 rounded-md hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rate
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-blue-400/50" />
            <span className="text-[10px] tracking-wider uppercase text-white/30">US States</span>
          </div>
          <p className="text-xl font-medium text-white/80">{usStateCount}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-purple-400/50" />
            <span className="text-[10px] tracking-wider uppercase text-white/30">Countries</span>
          </div>
          <p className="text-xl font-medium text-white/80">{countryCount}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-400/50" />
            <span className="text-[10px] tracking-wider uppercase text-white/30">Active</span>
          </div>
          <p className="text-xl font-medium text-white/80">{enabledCount}</p>
        </div>
      </div>

      {/* Seed Defaults */}
      {(usStateCount === 0 || countryCount === 0) && (
        <div className="bg-amber-500/[0.05] border border-amber-500/[0.12] rounded-lg p-4">
          <p className="text-sm text-white/60 mb-3">
            {usStateCount === 0 && countryCount === 0
              ? "No tax rates configured yet. Seed defaults to get started:"
              : "Seed additional tax rates:"}
          </p>
          <div className="flex gap-2">
            {usStateCount === 0 && (
              <button
                onClick={() => handleSeed("us_states")}
                disabled={seeding}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-wider uppercase bg-blue-500/10 text-blue-400/70 rounded-md hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {seeding ? "Seeding…" : "Seed US State Rates"}
              </button>
            )}
            {countryCount === 0 && (
              <button
                onClick={() => handleSeed("international")}
                disabled={seeding}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-wider uppercase bg-purple-500/10 text-purple-400/70 rounded-md hover:bg-purple-500/20 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {seeding ? "Seeding…" : "Seed International Rates"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add New Rate Form */}
      {showAdd && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 space-y-3">
          <h3 className="text-[11px] tracking-wider uppercase text-white/30">Add New Tax Rate</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-white/25 block mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-white/70"
              >
                <option value="us_state" style={{ background: "#111" }}>US State</option>
                <option value="country" style={{ background: "#111" }}>Country</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/25 block mb-1">Code</label>
              <input
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder={newType === "us_state" ? "CA" : "GB"}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-white/70"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/25 block mb-1">Label</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="California Sales Tax"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-white/70"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/25 block mb-1">Rate (%)</label>
              <div className="flex gap-2">
                <input
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="7.25"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-white/70"
                />
                <button
                  onClick={handleAdd}
                  className="px-3 py-1.5 text-[10px] tracking-wider uppercase bg-green-500/10 text-green-400/70 rounded hover:bg-green-500/20 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white/[0.02] rounded-lg p-1 w-fit">
        {[
          { id: "all" as const, label: "All" },
          { id: "us_state" as const, label: "US States" },
          { id: "country" as const, label: "International" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1 text-[11px] tracking-wider rounded transition-colors ${
              filter === tab.id
                ? "bg-white/[0.08] text-white/80"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tax Rates Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-[10px] tracking-wider uppercase text-white/25 px-4 py-3">Region</th>
              <th className="text-left text-[10px] tracking-wider uppercase text-white/25 px-4 py-3">Label</th>
              <th className="text-left text-[10px] tracking-wider uppercase text-white/25 px-4 py-3">Type</th>
              <th className="text-left text-[10px] tracking-wider uppercase text-white/25 px-4 py-3">Rate</th>
              <th className="text-left text-[10px] tracking-wider uppercase text-white/25 px-4 py-3">Status</th>
              <th className="text-right text-[10px] tracking-wider uppercase text-white/25 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSettings.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs text-white/20">
                  No tax rates configured. Use "Seed Defaults" to add standard rates.
                </td>
              </tr>
            )}
            {filteredSettings.map((setting: any) => (
              <tr key={setting._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5">
                  <span className="text-xs font-mono text-amber-400/60">{setting.region}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-white/60">{setting.label}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded ${
                    setting.regionType === "us_state"
                      ? "bg-blue-500/10 text-blue-400/60"
                      : "bg-purple-500/10 text-purple-400/60"
                  }`}>
                    {setting.regionType === "us_state" ? "US State" : "Country"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {editingId === setting._id ? (
                    <input
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="w-20 bg-white/[0.06] border border-white/[0.1] rounded px-2 py-1 text-xs text-white/70"
                      autoFocus
                    />
                  ) : (
                    <span className="text-xs text-white/70 font-medium">
                      {(setting.rate * 100).toFixed(2)}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => handleToggle(setting)}
                    className="flex items-center gap-1.5 group"
                  >
                    {setting.enabled ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-green-400/60 group-hover:text-green-400/80" />
                        <span className="text-[10px] text-green-400/50">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-white/20 group-hover:text-white/40" />
                        <span className="text-[10px] text-white/20">Disabled</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {editingId === setting._id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(setting)}
                          className="p-1 text-green-400/60 hover:text-green-400 transition-colors"
                          title="Save"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-white/20 hover:text-white/50 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(setting._id);
                            setEditRate((setting.rate * 100).toFixed(2));
                            setEditEnabled(setting.enabled);
                          }}
                          className="p-1 text-white/20 hover:text-white/50 transition-colors"
                          title="Edit rate"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete tax rate for ${setting.label}?`)) {
                              deleteRate({ settingId: setting._id });
                            }
                          }}
                          className="p-1 text-red-400/30 hover:text-red-400/70 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shipping Info */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 space-y-3">
        <h3 className="text-[11px] tracking-wider uppercase text-white/30">
          International Shipping
        </h3>
        <p className="text-xs text-white/40 leading-relaxed">
          Shipping is handled through Printful's fulfillment network. Rates are calculated in real-time
          at checkout based on the customer's address. Currently shipping to 40+ countries worldwide.
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/[0.02] rounded p-3">
            <span className="text-white/25 text-[10px] uppercase tracking-wider">Domestic (US)</span>
            <p className="text-white/60 mt-1">3–7 business days</p>
          </div>
          <div className="bg-white/[0.02] rounded p-3">
            <span className="text-white/25 text-[10px] uppercase tracking-wider">International</span>
            <p className="text-white/60 mt-1">7–21 business days</p>
          </div>
        </div>
        <p className="text-[10px] text-white/20">
          International orders may be subject to local customs duties and import taxes upon delivery,
          which are the responsibility of the customer.
        </p>
      </div>
    </div>
  );
}

// ─── Loading State ──────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-xl mb-2 animate-pulse">✦</div>
        <p className="text-[11px] tracking-wider uppercase text-white/20">
          Loading...
        </p>
      </div>
    </div>
  );
}

// ─── Main Admin Page ────────────────────────────────────────────────────

export default function AdminPage() {
  const isAdmin = useQuery(api.users.isAdmin);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [crmCustomerId, setCrmCustomerId] = useState<string | undefined>();

  // Admin guard
  if (isAdmin === undefined) return <LoadingState />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
          <h1 className="text-lg font-medium text-white/70">Access Denied</h1>
          <p className="text-sm text-white/30 mt-1">
            You don't have admin privileges.
          </p>
        </div>
      </div>
    );
  }

  const handleCustomerSelect = (id: string) => {
    setCrmCustomerId(id);
    setActiveTab("crm");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "orders":
        return <OrdersTab />;
      case "products":
        return <ProductsTab />;
      case "customers":
        return <CustomersTab onSelectCustomer={handleCustomerSelect} />;
      case "crm":
        return <CrmTab preselectedCustomerId={crmCustomerId} />;
      case "newsletter":
        return <NewsletterTab />;
      case "shipping":
        return <ShippingTab />;
      case "tax":
        return <TaxTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex min-h-screen -mx-4 sm:-mx-6 lg:-mx-8 -mt-4">
      <Sidebar active={activeTab} onSelect={setActiveTab} />
      <main className="flex-1 p-6 overflow-y-auto">{renderTab()}</main>
    </div>
  );
}
