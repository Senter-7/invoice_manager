import React from "react";
import { Upload, FileText, Plus, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyDocumentStateProps {
    onFileUpload: () => void;
}

export function EmptyDocumentState({ onFileUpload }: EmptyDocumentStateProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] animate-fade-in p-6">
            <div className="relative mb-8">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full" />

                <div className="relative w-24 h-24 bg-secondary/30 rounded-3xl border border-border/50 flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-12 h-12 text-muted-foreground/50" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce-slow">
                        <Plus className="w-6 h-6 text-background" />
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3 text-center tracking-tight">
                No Documents Processed
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-10 text-lg leading-relaxed">
                Upload your first document to start extracting intelligent insights with our AI-powered engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
                <div className="glass-panel p-5 flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold mb-1">Drag & Drop</h3>
                    <p className="text-xs text-muted-foreground">PDF, Office, Images, or EML</p>
                </div>

                <div className="glass-panel p-5 flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold mb-1">AI Extraction</h3>
                    <p className="text-xs text-muted-foreground">Instant field & table recognition</p>
                </div>

                <div className="glass-panel p-5 flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold mb-1">Secure</h3>
                    <p className="text-xs text-muted-foreground">Enterprise-grade encryption</p>
                </div>
            </div>

            <Button
                onClick={onFileUpload}
                size="lg"
                className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-base shadow-xl shadow-primary/20 gap-3"
            >
                <Upload className="w-5 h-5" />
                Upload Document
            </Button>
        </div>
    );
}
