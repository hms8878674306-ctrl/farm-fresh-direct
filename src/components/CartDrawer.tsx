import { X, Minus, Plus, Trash2, Sparkles } from "lucide-react";
import { useCart, cart, cartTotal, effectivePrice, cartAvgDistance } from "@/lib/cart-store";
import { useDeals } from "@/lib/deals-store";
import { deliveryFee, FREE_DELIVERY_THRESHOLD } from "@/lib/delivery";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useCart();
  useDeals(); // re-render when deals change
  const total = cartTotal(s);
  const avgKm = cartAvgDistance(s);
  const fee = deliveryFee(total, avgKm);
  const grand = total + fee;
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} />
      <aside className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background shadow-glow flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="display text-2xl font-bold">Your Basket</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {s.items.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-6xl mb-4">🧺</div>
              <p>Your basket is empty.</p>
            </div>
          )}
          {s.items.map(({ product, qty }) => {
            const unit = effectivePrice(product);
            const negotiated = unit !== product.price;
            return (
            <div key={product.id} className="flex gap-3 rounded-xl bg-card border border-border p-3 animate-leaf-grow">
              <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate flex items-center gap-1.5">
                  {product.name}
                  {negotiated && <span title="Negotiated price" className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-fresh"><Sparkles className="h-3 w-3" /> Deal</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {negotiated ? <><span className="line-through mr-1">₹{product.price}</span><span className="text-fresh font-semibold">₹{unit}</span></> : <>₹{unit}</>}/{product.unit}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 rounded-full border border-border p-1">
                    <button onClick={() => cart.setQty(product.id, qty - 1)} className="h-6 w-6 rounded-full hover:bg-muted inline-flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-xs font-bold">{qty}</span>
                    <button onClick={() => cart.setQty(product.id, qty + 1)} className="h-6 w-6 rounded-full hover:bg-muted inline-flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="font-bold text-primary">₹{unit * qty}</div>
                </div>
              </div>
              <button onClick={() => cart.remove(product.id)} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive inline-flex items-center justify-center self-start"><Trash2 className="h-4 w-4" /></button>
            </div>
            );
          })}
        </div>

        <div className="border-t border-border p-5 space-y-3">
          {total > 0 && total < FREE_DELIVERY_THRESHOLD && (
            <div className="rounded-lg bg-harvest/10 border border-harvest/30 px-3 py-2 text-[11px]">
              Add <b>₹{FREE_DELIVERY_THRESHOLD - total}</b> more for <b>FREE delivery</b> 🚚
            </div>
          )}
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{total}</span></div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery {avgKm > 0 && <span className="text-[10px]">(~{avgKm.toFixed(1)} km)</span>}</span>
            {fee === 0 ? <span className="text-fresh font-semibold">FREE</span> : <span>₹{fee}</span>}
          </div>
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">₹{grand}</span></div>
          <Link
            to="/checkout"
            onClick={onClose}
            className={`block text-center w-full h-12 leading-[3rem] rounded-xl font-bold transition ${s.items.length === 0 ? "bg-muted text-muted-foreground pointer-events-none" : "bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow"}`}
          >
            Checkout →
          </Link>
        </div>
      </aside>
    </>
  );
}
