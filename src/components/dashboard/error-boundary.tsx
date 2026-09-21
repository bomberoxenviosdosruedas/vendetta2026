'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="p-4 text-center text-muted-foreground border border-border/40 rounded-lg bg-background/50">
                    <p className="font-medium text-foreground">Error cargando esta sección</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {this.state.error?.message || 'Error desconocido'}
                    </p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-2 text-xs text-primary hover:underline"
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export function DashboardSectionErrorFallback({ title = 'Sección no disponible' }: { title?: string }) {
    return (
        <div className="p-4 text-center text-muted-foreground border border-border/40 rounded-lg bg-background/50">
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">No se pudo cargar esta sección</p>
        </div>
    );
}