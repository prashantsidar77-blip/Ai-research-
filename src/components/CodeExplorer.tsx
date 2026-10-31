import React, { useState } from 'react';
import { ANDROID_FILES, AndroidFileRecord } from '../androidFilesData';
import {
  FileCode,
  Copy,
  Check,
  Search,
  Folder,
  ChevronRight,
  ChevronDown,
  Download,
  Terminal,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/zipDownloader';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileRecord>(
    ANDROID_FILES.find((f) => f.path.includes('MainActivity.kt')) || ANDROID_FILES[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const filteredFiles = ANDROID_FILES.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadAndroidProjectZip((p) => setZipProgress(p));
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#070b18] border border-cyan-500/25 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#0a1128] border-b border-cyan-500/20 gap-3">
        <div className="flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wider">
            NATIVE ANDROID SOURCE TREE (35 FILES)
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-500/30">
            Jetpack Compose • Room • Kotlin 2.0
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? `Archiving (${zipProgress}%)...` : 'Download Android Studio (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: File Tree (Left) + Code Viewer (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Explorer Sidebar */}
        <div className="w-72 bg-[#050811] border-r border-cyan-500/20 flex flex-col">
          {/* Search box */}
          <div className="p-2 border-b border-cyan-500/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search files (e.g. FloatingService)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a1128] border border-cyan-500/20 text-xs text-white rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
              />
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              const fileName = file.path.split('/').pop();
              const dirName = file.path.split('/').slice(0, -1).join('/');

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center space-x-2 transition-colors ${
                    isSelected
                      ? 'bg-blue-950 text-cyan-300 font-bold border border-cyan-500/40 shadow'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="truncate flex-1">
                    <span className="truncate">{fileName}</span>
                    <span className="block text-[9px] text-slate-600 truncate">{dirName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Display */}
        <div className="flex-1 flex flex-col bg-[#070b18] overflow-hidden">
          {/* File Meta Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0a1128]/80 border-b border-cyan-500/15 text-xs">
            <div className="flex items-center space-x-2 font-mono text-slate-300 truncate">
              <span className="text-cyan-400 font-bold">{selectedFile.path}</span>
              <span className="text-[10px] text-slate-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#0f1e40] border border-cyan-500/30 text-cyan-300 hover:bg-[#142652] text-xs font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Syntax Code Container */}
          <div className="flex-1 overflow-auto p-4 bg-[#04060d] font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="whitespace-pre">
              <code>
                {selectedFile.content.split('\n').map((line, idx) => (
                  <div key={idx} className="flex hover:bg-white/5">
                    <span className="w-10 text-right pr-4 text-slate-600 select-none flex-shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
