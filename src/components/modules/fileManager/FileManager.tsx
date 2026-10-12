import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  Image as ImageIcon, 
  FileText, 
  File, 
  Upload, 
  Copy, 
  Check, 
  Search, 
  Grid, 
  List, 
  Plus, 
  Eye, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  HardDrive,
  Info
} from 'lucide-react';
import { 
  ManagedFile, 
  FolderItem, 
  DEFAULT_FOLDERS, 
  getStoredFiles, 
  saveStoredFiles, 
  addFileToFolder 
} from '../../../data/fileManagerData';

interface FileManagerProps {
  onSelectFile?: (file: ManagedFile) => void;
  selectionMode?: boolean;
}

export const FileManager: React.FC<FileManagerProps> = ({ 
  onSelectFile, 
  selectionMode = false 
}) => {
  const [folders, setFolders] = useState<FolderItem[]>(DEFAULT_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string>('website-assets');
  const [files, setFiles] = useState<ManagedFile[]>(getStoredFiles);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<ManagedFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setFiles(getStoredFiles());
    };
    window.addEventListener('file-manager-updated', handleUpdate);
    return () => window.removeEventListener('file-manager-updated', handleUpdate);
  }, []);

  const activeFolder = folders.find(f => f.id === activeFolderId) || folders[0];

  const filteredFiles = files.filter(file => {
    const matchesFolder = file.folder === activeFolderId;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCopyUrl = (file: ManagedFile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const isImg = uploadedFile.type.startsWith('image/');
      const newFile = addFileToFolder({
        name: uploadedFile.name,
        folder: activeFolderId,
        url: reader.result as string,
        size: `${(uploadedFile.size / 1024).toFixed(1)} KB`,
        type: isImg ? 'image' : uploadedFile.type.includes('pdf') ? 'pdf' : 'document',
        dimensions: isImg ? 'Custom' : undefined,
      });
      setSelectedFile(newFile);
      setIsUploading(false);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this asset?')) {
      const updated = files.filter(f => f.id !== id);
      setFiles(updated);
      saveStoredFiles(updated);
      if (selectedFile?.id === id) {
        setSelectedFile(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <HardDrive className="w-6 h-6 text-blue-600" />
            File Manager
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage website assets, brand logos, images and downloadable documents
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUploadFile} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Folder Tree */}
        <div className="w-64 border-r border-gray-200 bg-gray-50/40 p-4 flex flex-col gap-1 shrink-0">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
            Storage Folders
          </div>
          {folders.map(folder => {
            const count = files.filter(f => f.folder === folder.id).length;
            const isActive = activeFolderId === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setActiveFolderId(folder.id);
                  setSelectedFile(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 fill-blue-100' : 'text-gray-400'}`} />
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-gray-200/60 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="mt-auto p-3 bg-amber-50 rounded-lg border border-amber-200/60 text-[11px] text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Info className="w-3.5 h-3.5" />
              Website Assets Folder
            </p>
            <p className="leading-relaxed">
              Files in this folder are directly accessible by your Header, Footer & Global CSS themes.
            </p>
          </div>
        </div>

        {/* Center File Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb & Filter Bar */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-400">All Files</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <span className="font-bold text-gray-900">{activeFolder.name}</span>
              <span className="text-xs text-gray-400">({filteredFiles.length} items)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="Filter files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                />
              </div>

              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Files Grid / List */}
          <div className="flex-1 p-5 overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <Folder className="w-12 h-12 text-gray-300 mb-2 stroke-1" />
                <p className="text-sm font-semibold text-gray-700">No files found in {activeFolder.name}</p>
                <p className="text-xs text-gray-400 mt-1">Upload images or convert a design to generate assets</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredFiles.map(file => {
                  const isSelected = selectedFile?.id === file.id;
                  const isCopied = copiedId === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file);
                        if (selectionMode && onSelectFile) onSelectFile(file);
                      }}
                      className={`group border rounded-xl p-3 flex flex-col cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/20' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-gray-100 relative group">
                        {file.type === 'image' ? (
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : file.type === 'pdf' ? (
                          <FileText className="w-10 h-10 text-red-500" />
                        ) : (
                          <File className="w-10 h-10 text-blue-500" />
                        )}

                        {/* Hover Overlay Buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => handleCopyUrl(file, e)}
                            className="p-1.5 bg-white text-gray-800 rounded-md hover:bg-gray-100 transition-colors shadow-xs"
                            title="Copy File Path"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="mt-2.5">
                        <p className="text-xs font-semibold text-gray-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                          <span>{file.size}</span>
                          {file.dimensions && <span>{file.dimensions}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Size</th>
                      <th className="py-2.5 px-4">Dimensions</th>
                      <th className="py-2.5 px-4">Relative URL</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFiles.map(file => {
                      const isSelected = selectedFile?.id === file.id;
                      const isCopied = copiedId === file.id;
                      return (
                        <tr 
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50/40' : ''}`}
                        >
                          <td className="py-2.5 px-4 flex items-center gap-2.5 font-medium text-gray-900">
                            {file.type === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            )}
                            <span className="truncate max-w-xs">{file.name}</span>
                          </td>
                          <td className="py-2.5 px-4 text-gray-500">{file.size}</td>
                          <td className="py-2.5 px-4 text-gray-500">{file.dimensions || '—'}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-gray-500">{file.url}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={(e) => handleCopyUrl(file, e)}
                              className="px-2.5 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 inline-flex items-center gap-1.5"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        {selectedFile && (
          <div className="w-72 border-l border-gray-200 bg-gray-50/50 p-5 flex flex-col gap-4 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Asset Details</h3>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Preview Box */}
            <div className="w-full aspect-video bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-center overflow-hidden">
              {selectedFile.type === 'image' ? (
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.name} 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <FileText className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-medium block">File Name</label>
                <p className="font-semibold text-gray-800 break-all">{selectedFile.name}</p>
              </div>

              <div>
                <label className="text-gray-400 font-medium block">File Size</label>
                <p className="text-gray-700">{selectedFile.size}</p>
              </div>

              {selectedFile.dimensions && (
                <div>
                  <label className="text-gray-400 font-medium block">Dimensions</label>
                  <p className="text-gray-700">{selectedFile.dimensions}</p>
                </div>
              )}

              <div>
                <label className="text-gray-400 font-medium block">Path / URL</label>
                <div className="mt-1 flex items-center gap-1.5">
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedFile.url} 
                    className="w-full bg-white border border-gray-200 px-2 py-1 rounded text-[11px] font-mono text-gray-700"
                  />
                  <button
                    onClick={() => handleCopyUrl(selectedFile)}
                    className="p-1 border border-gray-200 rounded hover:bg-gray-100 text-gray-600 shrink-0"
                    title="Copy Path"
                  >
                    {copiedId === selectedFile.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-medium block">Uploaded</label>
                <p className="text-gray-700">{selectedFile.uploadedAt}</p>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => handleCopyUrl(selectedFile)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                {copiedId === selectedFile.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedId === selectedFile.id ? 'URL Copied to Clipboard!' : 'Copy Asset URL'}
              </button>

              <button
                onClick={(e) => handleDeleteFile(selectedFile.id, e)}
                className="w-full py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Asset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
