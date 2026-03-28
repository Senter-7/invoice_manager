import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MatchingTransaction } from "./mockScenarios";
import { DocumentHighlights } from "./MatchSummary";
import { Eye, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface LineItemTableProps {
  data: MatchingTransaction | null;
  isExtracting: boolean;
  highlights?: DocumentHighlights;
}

export function LineItemTable({ data, isExtracting, highlights }: LineItemTableProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  if (!data) {
    return (
      <div className="rounded-md border border-border/50 overflow-hidden bg-secondary/10 p-4 text-center text-xs text-muted-foreground">
        {isExtracting ? "Extracting..." : "No line items"}
      </div>
    );
  }

  const maxItems = Math.max(
    data.purchaseOrder.lineItems.length,
    data.grn.lineItems.length,
    data.invoice.lineItems.length
  );

  return (
    <>

      <div className="rounded-md border border-border/50 overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50 h-10">
              <TableHead className="text-xs font-semibold text-primary">PO Item Name</TableHead>
              <TableHead className="text-xs font-semibold text-primary">PO Item Code</TableHead>


              <TableHead className="text-xs font-semibold text-primary text-center">Quantity Matching</TableHead>
              <TableHead className="text-xs font-semibold text-primary text-right">Invoice Rate</TableHead>
              <TableHead className="text-xs font-semibold text-primary text-right">Invoice Quantity</TableHead>
              <TableHead className="text-xs font-semibold text-primary text-center">Status</TableHead>
              <TableHead className="text-xs font-semibold text-primary text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: maxItems }).map((_, i) => {
              const poItem = data.purchaseOrder.lineItems[i];
              const grnItem = data.grn.lineItems[i];
              const invItem = data.invoice.lineItems[i];

              const poQty = poItem?.quantity || 0;
              const grnQty = grnItem?.quantity || 0;
              const invQty = invItem?.quantity || 0;
              const pendingQty = poQty - invQty;

              const getPercent = (base: number, val: number) => {
                if (base === 0) return val === 0 ? 100 : 0;
                return Math.round((val / base) * 100);
              };
              const poToGrnPercent = getPercent(poQty, grnQty);
              const grnToInvPercent = getPercent(grnQty, invQty);

              const isQtyMismatch = poQty !== grnQty || poQty !== invQty;

              const poCurrency = data.purchaseOrder.currency;
              const invCurrency = data.invoice.currency;
              let isPriceMismatch = false;
              let isItemMismatch = false;

              if (poItem && invItem) {
                isItemMismatch = poItem.item !== invItem.item;
                if (poCurrency === invCurrency) {
                  isPriceMismatch = poItem.unitPrice !== invItem.unitPrice;
                } else {
                  // Mock conversion rate logic (e.g., 1 AED = 22.72 INR)
                  let exchangeRate = 1;
                  const ratesToINR: Record<string, number> = {
                    AED: 22.72, USD: 83.50, EUR: 89.20, GBP: 104.50, SGD: 61.30, INR: 1
                  };

                  const poRate = ratesToINR[poCurrency] || 1;
                  const invRate = ratesToINR[invCurrency] || 1;

                  // Conversion factor to bring PO currency into Invoice currency
                  exchangeRate = poRate / invRate;

                  // Allow for a small rounding tolerance for converted matching
                  const convertedPoPrice = poItem.unitPrice * exchangeRate;
                  isPriceMismatch = Math.abs(convertedPoPrice - invItem.unitPrice) > 1; // 1 unit tolerance
                }
              }

              const isAnyMismatch = isQtyMismatch || isPriceMismatch || isItemMismatch;

              return (
                <TableRow
                  key={i}
                  className="border-border/50 transition-colors hover:bg-secondary/10 group cursor-pointer"
                  onClick={() => setSelectedItemIndex(i)}
                >
                  <TableCell className="py-4 text-xs font-medium text-foreground max-w-[200px]">
                    <div className="line-clamp-2" title={poItem?.item || "-"}>
                      {poItem?.item || "-"}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 text-xs text-muted-foreground">
                    {/* Mock Code since actual data doesn't have it */}
                    {poItem ? `PO-ITEM-${1000 + i}` : "-"}
                  </TableCell>

                  {/* <TableCell className="py-4 text-xs text-right font-mono">
                    {poItem ? `${poItem.unitPrice.toFixed(0)} ${data.purchaseOrder.currency}` : "-"}
                  </TableCell> */}



                  <TableCell className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Flow Visual */}
                      <div className="flex flex-col items-center bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded text-[10px] font-semibold leading-tight min-w-[40px]">
                        <span>PO</span>
                        <span className="text-[11px] text-foreground">{poQty}</span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-muted-foreground font-medium">{poToGrnPercent}%</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>

                      <div className={cn(
                        "flex flex-col items-center px-2.5 py-1 rounded text-[10px] font-semibold leading-tight min-w-[48px]",
                        grnQty === poQty ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        <div className="flex items-center gap-1">
                          <span>GRN</span>
                        </div>
                        <span className="text-[11px] text-foreground">{grnQty}</span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-muted-foreground font-medium">{grnToInvPercent}%</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>

                      <div className="flex gap-1.5 ml-1">
                        <div className={cn(
                          "flex flex-col items-center px-2 py-0.5 rounded text-[9px] font-semibold leading-tight justify-center min-w-[60px]",
                          isQtyMismatch ? "bg-orange-500/10 text-orange-500" : "bg-purple-500/10 text-purple-500"
                        )}>
                          <div className="flex items-center gap-1">
                            <span>INVOICED</span>
                            {isQtyMismatch && <AlertTriangle className="w-2.5 h-2.5" />}
                          </div>
                          <span className="text-[11px] text-foreground">{invQty}</span>
                        </div>

                        <div className="flex flex-col items-center bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded text-[9px] font-semibold leading-tight justify-center min-w-[56px]">
                          <span>PENDING</span>
                          <span className="text-[11px] text-foreground">{pendingQty}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 text-xs text-right font-mono">
                    {invItem ? `${invItem.invoiceRate.toFixed(0)} ${data.invoice.currency}` : "-"}
                  </TableCell>

                  <TableCell className="py-4 text-xs font-semibold text-center">
                    {invQty}
                  </TableCell>

                  <TableCell className="py-4 text-center">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      isAnyMismatch ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {isAnyMismatch ? "Mismatch" : "Match"}
                    </span>
                  </TableCell>

                  <TableCell className="py-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-primary hover:bg-primary/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemIndex(i);
                      }}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LineItemDetailModal
        isOpen={selectedItemIndex !== null}
        onClose={() => setSelectedItemIndex(null)}
        data={data}
        index={selectedItemIndex!}
        highlights={highlights}
      />
    </>
  );
}

function LineItemDetailModal({ isOpen, onClose, data, index, highlights }: { isOpen: boolean, onClose: () => void, data: MatchingTransaction, index: number, highlights?: DocumentHighlights }) {
  if (!isOpen || !data) return null;

  const poItem = data.purchaseOrder.lineItems[index];
  const grnItem = data.grn.lineItems[index];
  const invItem = data.invoice.lineItems[index];

  const isItemHighlighted = highlights?.lineItems.some(h => h.index === index && h.field === "item");
  const isQtyHighlighted = highlights?.lineItems.some(h => h.index === index && h.field === "quantity");
  const isPriceHighlighted = highlights?.lineItems.some(h => h.index === index && h.field === "unitPrice");
  const isCurrencyHighlighted = highlights?.lineItems.some(h => h.index === index && h.field === "currency");
  const isTaxAmountHighlighted = highlights?.lineItems.some(h => h.index === index && h.field === "taxAmount");
  const isTotalHighlighted = highlights?.lineItems.some(h => h.index === index && h.field === "totalAfterTax");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg">Line Item Details (Row {index + 1})</DialogTitle>
        </DialogHeader>

        <div className="mt-4 rounded-md border border-border/50 overflow-hidden bg-secondary/10">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50 h-8">
                <TableHead className="h-8 text-[11px] font-semibold text-primary w-48">Field</TableHead>
                <TableHead className="h-8 text-[11px] font-semibold text-primary border-l border-border/50">Purchase Order</TableHead>
                <TableHead className="h-8 text-[11px] font-semibold text-primary border-l border-border/50">Goods Received Note</TableHead>
                <TableHead className="h-8 text-[11px] font-semibold text-primary border-l border-border/50">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Description / Item */}
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-muted-foreground">Description</TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isItemHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {poItem?.item || <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isItemHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {grnItem?.item || <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isItemHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {invItem?.item || <span className="text-muted-foreground/30">-</span>}
                </TableCell>
              </TableRow>

              {/* Quantity */}
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-muted-foreground">Quantity</TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isQtyHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {poItem?.quantity ?? <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isQtyHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {grnItem?.quantity ?? <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isQtyHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {invItem?.quantity ?? <span className="text-muted-foreground/30">-</span>}
                </TableCell>
              </TableRow>

              {/* Unit Price */}
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-muted-foreground">Unit Price</TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isPriceHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {poItem ? `${poItem.unitPrice.toLocaleString()}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isPriceHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {grnItem ? `${grnItem.unitPrice.toLocaleString()}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isPriceHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {invItem ? `${invItem.unitPrice.toLocaleString()}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
              </TableRow>

              {/* Currency */}
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-muted-foreground">Currency</TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isCurrencyHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {poItem ? data.purchaseOrder.currency : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isCurrencyHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {grnItem ? data.grn.currency : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isCurrencyHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {invItem ? data.invoice.currency : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
              </TableRow>

              {/* Tax Rate (Mock Data: Assume 5% or 0 based on some logic, let's just use 5% for the demo) */}
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-muted-foreground">Tax Rate</TableCell>
                <TableCell className="py-3 text-xs border-l border-border/50">
                  {poItem ? "5%" : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className="py-3 text-xs border-l border-border/50">
                  {grnItem ? "5%" : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className="py-3 text-xs border-l border-border/50">
                  {invItem ? "5%" : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
              </TableRow>

              {/* Tax Amount */}
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-muted-foreground">Tax Amount</TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isTaxAmountHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {poItem ? `${(poItem.unitPrice * poItem.quantity * 0.05).toLocaleString()}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isTaxAmountHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {grnItem ? `${(grnItem.unitPrice * grnItem.quantity * 0.05).toLocaleString()}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50", isTaxAmountHighlighted && "bg-destructive/10 text-destructive font-semibold")}>
                  {invItem ? `${(invItem.unitPrice * invItem.quantity * 0.05).toLocaleString()}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
              </TableRow>

              {/* Total After Tax */}
              <TableRow className="border-border/50 hover:bg-transparent bg-secondary/5 font-semibold">
                <TableCell className="py-3 text-xs text-foreground">Total After Tax</TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50 text-foreground", isTotalHighlighted && "bg-destructive/10 text-destructive")}>
                  {poItem ? `${(poItem.unitPrice * poItem.quantity * 1.05).toLocaleString()} ${data.purchaseOrder.currency}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50 text-foreground", isTotalHighlighted && "bg-destructive/10 text-destructive")}>
                  {grnItem ? `${(grnItem.unitPrice * grnItem.quantity * 1.05).toLocaleString()} ${data.grn.currency}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
                <TableCell className={cn("py-3 text-xs border-l border-border/50 text-foreground", isTotalHighlighted && "bg-destructive/10 text-destructive")}>
                  {invItem ? `${(invItem.unitPrice * invItem.quantity * 1.05).toLocaleString()} ${data.invoice.currency}` : <span className="text-muted-foreground/30">-</span>}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
