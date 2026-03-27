import { useState, useRef } from "react";
import { toast } from "sonner";
import { Document, AutoTag, ApiResponse, ExtractedField, LineItem, ApiResponseData } from "./types";
import { sampleDocuments, initialAutoTags, initialExtractedFields, lineItems as initialLineItems } from "./data";
import { extractDocumentData } from "./documentService";

export function useDocumentDemo() {
    const [docs, setDocs] = useState<Document[]>(sampleDocuments);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(sampleDocuments.length > 0 ? sampleDocuments[0] : null);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);
    const [hoveredField, setHoveredField] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<number | null>(null);
    const [tags, setTags] = useState<AutoTag[]>(initialAutoTags);
    const [displayFields, setDisplayFields] = useState<ExtractedField[]>(initialExtractedFields);
    const [displayLineItems, setDisplayLineItems] = useState<LineItem[]>(initialLineItems);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mapApiDataToTags = (data: ApiResponseData): AutoTag[] => {
        const tags: AutoTag[] = [];
        const { vendor_details, amount_details, items } = data;

        if (vendor_details.vendor_name) {
            tags.push({ tag: `vendor:${vendor_details.vendor_name.toLowerCase().replace(/\s+/g, '-')}`, accepted: true });
        }
        if (amount_details.currency) {
            tags.push({ tag: `currency:${amount_details.currency.toLowerCase()}`, accepted: true });
        }
        if (amount_details.total_amount) {
            tags.push({ tag: `amount:${amount_details.total_amount}`, accepted: true });
        }
        if (items && items.length > 0) {
            tags.push({ tag: `items:${items.length}`, accepted: true });
        }

        return tags;
    };

    const mapApiDataToFields = (data: ApiResponseData): ExtractedField[] => {
        const fields: ExtractedField[] = [];
        const { invoice_details, vendor_details, amount_details, customer_details } = data;

        if (invoice_details.invoice_number) {
            fields.push({ label: "Invoice Number", value: invoice_details.invoice_number, confidence: 99, bbox: { x: 65, y: 12, w: 20, h: 4 } });
        }
        if (invoice_details.invoice_date) {
            fields.push({ label: "Date", value: invoice_details.invoice_date, confidence: 99, bbox: { x: 65, y: 17, w: 18, h: 4 } });
        }
        if (invoice_details.due_date) {
            fields.push({ label: "Due Date", value: invoice_details.due_date, confidence: 99, bbox: { x: 65, y: 22, w: 18, h: 4 } });
        }
        if (invoice_details.payment_terms) {
            fields.push({ label: "Payment Terms", value: invoice_details.payment_terms, confidence: 99, bbox: { x: 65, y: 27, w: 18, h: 4 } });
        }
        if (invoice_details.purchase_order_number) {
            fields.push({ label: "PO Number", value: invoice_details.purchase_order_number, confidence: 99, bbox: { x: 65, y: 32, w: 18, h: 4 } });
        }
        if (vendor_details.vendor_name) {
            fields.push({ label: "Vendor", value: vendor_details.vendor_name, confidence: 99, bbox: { x: 10, y: 8, w: 25, h: 5 } });
        }
        if (vendor_details.vendor_address) {
            fields.push({ label: "Vendor Address", value: vendor_details.vendor_address, confidence: 99, bbox: { x: 10, y: 13, w: 25, h: 8 } });
        }
        if (customer_details.customer_name) {
            fields.push({ label: "Customer", value: customer_details.customer_name, confidence: 99, bbox: { x: 10, y: 27, w: 25, h: 4 } });
        }
        if (customer_details.customer_address) {
            fields.push({ label: "Customer Address", value: customer_details.customer_address, confidence: 99, bbox: { x: 10, y: 32, w: 25, h: 8 } });
        }
        if (amount_details.total_amount) {
            fields.push({ label: "Amount", value: `${amount_details.currency || ''} ${amount_details.total_amount}`, confidence: 99, bbox: { x: 70, y: 75, w: 15, h: 5 } });
        }
        if (amount_details.tax_amount) {
            fields.push({ label: "Tax", value: `${amount_details.currency || ''} ${amount_details.tax_amount}`, confidence: 99, bbox: { x: 70, y: 70, w: 12, h: 4 } });
        }
        if (amount_details.bank_acc_no) {
            fields.push({ label: "Bank Account", value: amount_details.bank_acc_no, confidence: 99, bbox: { x: 10, y: 85, w: 20, h: 4 } });
        }
        if (amount_details.iban) {
            fields.push({ label: "IBAN", value: amount_details.iban, confidence: 99, bbox: { x: 10, y: 90, w: 30, h: 4 } });
        }

        return fields;
    };

    const mapApiItemsToLineItems = (items: any[]): LineItem[] => {
        return items.map(item => ({
            description: item.item_name || item.item_description || "Item",
            quantity: parseFloat(item.quantity) || 0,
            unitPrice: parseFloat(item.item_rate) || 0,
            total: parseFloat(item.item_total_amount) || 0
        }));
    };

    const handleDocSelect = (doc: Document) => {
        setSelectedDoc(doc);
        setCurrentPage(1);

        if (doc.extractedData) {
            setDisplayFields(mapApiDataToFields(doc.extractedData));
            setDisplayLineItems(mapApiItemsToLineItems(doc.extractedData.items));
            setTags(mapApiDataToTags(doc.extractedData));
        } else {
            // For sample docs, use initial data
            setDisplayFields(initialExtractedFields);
            setDisplayLineItems(initialLineItems);
            setTags(initialAutoTags);
        }

        toast.info(`Selected: ${doc.name}`);
    };

    const handleNextPage = () => {
        if (selectedDoc && currentPage < selectedDoc.pages) {
            setCurrentPage(prev => prev + 1);
        } else if (selectedDoc) {
            toast.error("Already on the last page");
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else {
            toast.error("Already on the first page");
        }
    };

    const handleTagToggle = (index: number) => {
        setTags(prev => {
            const newTags = [...prev];
            newTags[index].accepted = !newTags[index].accepted;
            toast.success(`Tag ${newTags[index].tag} ${newTags[index].accepted ? 'accepted' : 'rejected'}`);
            return newTags;
        });
    };

    const handleDocDelete = (docId: number) => {
        setDocs(prev => {
            const newDocs = prev.filter(d => d.id !== docId);
            // If we deleted the selected doc, select another one if available
            if (selectedDoc.id === docId && newDocs.length > 0) {
                handleDocSelect(newDocs[0]);
            }
            return newDocs;
        });
        toast.success("Document removed from queue");
    };

    const handleExport = (type: string) => {
        if (!selectedDoc) return;
        if (type === "JSON") {
            const dataToExport = {
                documentName: selectedDoc.name,
                extractedFields: displayFields,
                lineItems: displayLineItems,
                rawApiData: selectedDoc.extractedData
            };
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedDoc.name.split('.')[0]}_extracted.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("JSON export downloaded successfully");
            return;
        }

        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: `Syncing with ${type}...`,
            success: () => {
                setShowSuccess(true);
                return `Successfully sent to ${type} system`;
            },
            error: `${type} export failed`,
        });
    };

    const handleApprove = () => {
        if (!selectedDoc) return;
        toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: 'Approving and triggering workflow...',
            success: () => {
                // Update doc status locally
                setDocs(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, status: 'processed' } : d));
                setShowSuccess(true);
                return 'Document approved and sent to workflow';
            },
            error: 'Approval failed',
        });
    };

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const countPdfPages = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                // Count occurrences of /Type /Page (standard PDF page marker)
                const matches = content.match(/\/Type\s*\/Page\b/g);
                resolve(matches ? matches.length : 1);
            };
            reader.readAsBinaryString(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            const newDocId = Date.now();

            let detectedPages = 1;
            if (file.name.toLowerCase().endsWith('.pdf')) {
                detectedPages = await countPdfPages(file);
            }

            const newDoc: Document = {
                id: newDocId,
                name: file.name,
                pages: detectedPages,
                type: "invoice",
                status: "processing",
                fileUrl
            };

            setDocs(prev => [newDoc, ...prev]);
            setSelectedDoc(newDoc);
            setCurrentPage(1);

            // Clear current display data while processing
            setDisplayFields([]);
            setDisplayLineItems([]);
            setTags([]);

            toast.promise(extractDocumentData(file), {
                loading: `Uploading and analyzing ${file.name}...`,
                success: (response: ApiResponse) => {
                    console.log("API Response:", response);
                    const extractedFields = mapApiDataToFields(response.data);
                    const lineItems = mapApiItemsToLineItems(response.data.items);

                    const updatedDoc: Document = {
                        ...newDoc,
                        status: "processed" as const,
                        extractedData: response.data,
                        pages: detectedPages, // Use our detected count
                        fileUrl
                    };

                    setDocs(prev => prev.map(d => d.id === newDocId ? updatedDoc : d));
                    setSelectedDoc(updatedDoc);
                    setDisplayFields(extractedFields);
                    setDisplayLineItems(lineItems);
                    setTags(mapApiDataToTags(response.data));
                    setCurrentPage(1);

                    return `${file.name} processed! Detected ${detectedPages} pages.`;
                },
                error: (err) => {
                    console.error("Extraction error:", err);
                    setDocs(prev => prev.map(d => d.id === newDocId ? { ...d, status: "error" as const } : d));
                    return `Extraction failed: ${err.message}`;
                },
            });
        }
    };

    const resetSampleDocs = () => {
        setDocs(sampleDocuments);
        setSelectedDoc(sampleDocuments[0]);
        setDisplayFields(initialExtractedFields);
        setDisplayLineItems(initialLineItems);
        toast.success("Sample documents restored");
    };

    return {
        selectedDoc,
        docs,
        currentPage,
        setCurrentPage,
        zoom,
        setZoom,
        hoveredField,
        setHoveredField,
        editingField,
        setEditingField,
        tags,
        displayFields,
        displayLineItems,
        fileInputRef,
        handleDocSelect,
        handleNextPage,
        handlePrevPage,
        handleTagToggle,
        handleExport,
        handleFileUpload,
        handleFileChange,
        handleApprove,
        handleDocDelete,
        resetSampleDocs,
        showSuccess,
        setShowSuccess
    };
}
