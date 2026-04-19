/**
 * ============================================================================
 * NetGuard Pro - واجهة معالجة الأخطاء (Error Boundary)
 * ============================================================================
 * 
 * 🛡️ الاسترداد التلقائي: Disaster Recovery
 * المسؤول عن:
 * 1. التقاط أخطاء الجافا سكريبت غير المتوقعة
 * 2. عرض واجهة "الوضع الآمن" (Safe Mode UI)
 * 3. توفير خيار لإعادة تشغيل النظام الفرعي
 * ============================================================================
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical System Failure:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060606] flex items-center justify-center p-8 tech-grid">
          <div className="max-w-md w-full glass-card p-12 text-center space-y-8 border-red-500/20">
            <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 w-fit mx-auto mb-4 animate-pulse">
              <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">System <span className="text-red-500">Crash</span></h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Critical Exception Detected</p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] text-red-400/60 text-left overflow-auto max-h-40">
              {this.state.error?.message || "Unknown Runtime Error"}
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Initialization
              </button>
              
              <button 
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white"
              >
                <Terminal className="w-4 h-4" />
                Emergency Core Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
