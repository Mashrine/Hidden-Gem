import React, { useState, useEffect } from 'react';
import { Database, Code, Copy, Check, Download, X, FileText, Layers } from 'lucide-react';

interface DBSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DBSchemaModal({ isOpen, onClose }: DBSchemaModalProps) {
  const [activeTab, setActiveTab] = useState<'sql' | 'dbml'>('sql');
  const [sqlContent, setSqlContent] = useState<string>('Loading SQL script...');
  const [dbmlContent, setDbmlContent] = useState<string>('Loading DBML schema...');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/database-scripts')
        .then((res) => res.json())
        .then((data) => {
          if (data.sql) setSqlContent(data.sql);
          if (data.dbml) setDbmlContent(data.dbml);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [isOpen]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'sql' ? sqlContent : dbmlContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'sql' ? sqlContent : dbmlContent;
    const filename = activeTab === 'sql' ? 'havenstay_schema.sql' : 'havenstay_schema.dbml';
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1e1e2e] text-gray-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#181825] px-6 py-4 flex justify-between items-center border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003527] flex items-center justify-center text-[#80bea6] border border-[#80bea6]/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Sơ Đồ Cơ Sở Dữ Liệu 8 Bảng (HavenStay DB)
                <span className="bg-[#80bea6]/20 text-[#80bea6] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-[#80bea6]/30">
                  PostgreSQL & DBML
                </span>
              </h3>
              <p className="text-xs text-gray-400">Khóa chính (PK), Khóa ngoại (FK CASCADE), Ràng buộc UNIQUE 1-1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#11111b] px-6 py-3 flex justify-between items-center border-b border-gray-800/80 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'sql'
                  ? 'bg-[#80bea6] text-[#003527] shadow'
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              PostgreSQL DDL (.sql)
            </button>
            <button
              onClick={() => setActiveTab('dbml')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dbml'
                  ? 'bg-[#9b4500] text-white shadow'
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              DBML ERD (dbdiagram.io)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 transition-colors flex items-center gap-1.5 border border-gray-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-[#003527] hover:bg-[#064e3b] text-xs font-medium text-[#80bea6] transition-colors flex items-center gap-1.5 border border-[#80bea6]/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Xuống</span>
            </button>
          </div>
        </div>

        {/* Code View Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#11111b] font-mono text-xs text-gray-300 leading-relaxed">
          <pre className="whitespace-pre-wrap select-all font-mono">
            {activeTab === 'sql' ? sqlContent : dbmlContent}
          </pre>
        </div>

        {/* Footer info */}
        <div className="bg-[#181825] px-6 py-3 border-t border-gray-800 text-[11px] text-gray-400 flex justify-between items-center shrink-0">
          <span>
            {activeTab === 'sql'
              ? '💡 Chạy câu lệnh SQL này trong pgAdmin, DBeaver hoặc PostgreSQL CLI để khởi tạo 8 bảng chuẩn.'
              : '💡 Dán toàn bộ mã DBML này vào https://dbdiagram.io để tự động vẽ sơ đồ ERD trực quan.'}
          </span>
          <span className="font-bold text-[#80bea6]">HavenStay DB Engine v1.0</span>
        </div>
      </div>
    </div>
  );
}
