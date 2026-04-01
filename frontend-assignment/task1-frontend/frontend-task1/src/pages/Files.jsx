import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles, uploadFile } from '../store/fileSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '../context/ToastContext';
import { X, File as FileIcon, Eye, Download, UploadCloud, ImageIcon, FileText, FileBadge, Film, Loader2 } from 'lucide-react';
import fileService from '../services/fileService';
import ViewToggle from '../components/ViewToggle';

// Helper to render proper icon based on MIME type
const getFileIcon = (mimeType) => {
  if (!mimeType) return <FileIcon size={32} />;
  if (mimeType.includes('image')) return <ImageIcon size={32} />;
  if (mimeType.includes('pdf')) return <FileBadge size={32} />;
  if (mimeType.includes('video')) return <Film size={32} />;
  if (mimeType.includes('text')) return <FileText size={32} />;
  return <FileIcon size={32} />;
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const Files = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.files || { items: [] });
  const { addToast } = useToast();
  
  const [openUpload, setOpenUpload] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for preview and download
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast({ title: 'Alert', description: 'Please select a file to upload first.', type: 'error' });
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await dispatch(uploadFile(formData)).unwrap();
      addToast({ title: 'Success', description: 'File uploaded securely.', type: 'success' });
      setOpenUpload(false);
      setSelectedFile(null);
    } catch (err) {
      addToast({ title: 'Upload Failed', description: err || 'Could not upload file.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      // Step 1: Generate a timed token (valid for 1 minute for immediate download)
      const data = await fileService.generateFileLink(file.id, 1);
      
      const backendUrl = data.download_url;
      const tokenMatches = backendUrl.match(/\/download\/([^/]+)/);
      const token = tokenMatches ? tokenMatches[1] : '';

      // Step 2: Fetch the blob using the token
      const downloadRes = await fileService.downloadFileBlob(token);

      // Step 3: Trigger browser download
      const blob = new Blob([downloadRes.data], { type: file.mime_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      addToast({ title: 'Downloading', description: `${file.filename} is being downloaded.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Download Error', description: 'Failed to process secure download.', type: 'error' });
    }
  };

  const handlePreview = async (file) => {
    setIsPreviewLoading(true);
    setPreviewFile(file);
    try {
      // Step 1: Generate a timed token
      const data = await fileService.generateFileLink(file.id, 5);
      
      const backendUrl = data.download_url;
      const tokenMatches = backendUrl.match(/\/download\/([^/]+)/);
      const token = tokenMatches ? tokenMatches[1] : '';

      // Step 2: Fetch the blob
      const previewRes = await fileService.downloadFileBlob(token);

      // Step 3: Create preview URL
      const blob = new Blob([previewRes.data], { type: file.mime_type });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      addToast({ title: 'Preview Error', description: 'Could not load file preview.', type: 'error' });
      setPreviewFile(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl('');
    setIsPreviewLoading(false);
  };

  return (
    <Layout>
      <Navbar title="Documents" description="Access and share your secure files.">
        <div className="flex items-center gap-4 mr-4">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <Dialog.Root open={openUpload} onOpenChange={setOpenUpload}>
          <Dialog.Trigger asChild>
            <button 
              onClick={() => setSelectedFile(null)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all">
              <UploadCloud size={18} /> Upload File
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 max-h-[90vh] overflow-y-auto outline-none">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-2xl font-bold">Secure Upload</Dialog.Title>
                <Dialog.Close className="text-slate-400"><X size={24} /></Dialog.Close>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-indigo-200 border-dashed rounded-[2rem] cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-12 h-12 text-indigo-400 mb-4" />
                    <p className="text-base text-slate-600 font-bold text-center px-4 mb-1">
                      {selectedFile ? selectedFile.name : "Click to select a file"}
                    </p>
                    <p className="text-xs text-slate-400 font-medium text-center px-4">
                      {selectedFile ? formatBytes(selectedFile.size) : "PDF, Images, MP4, Plain Text (Max 5MB)"}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-4 hover:bg-indigo-700 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {isUploading ? 'Uploading safely...' : 'Start Secure Upload'}
                </button>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Navbar>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && items.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium">Loading documents...</div>
          ) : items.length > 0 ? items.map(file => (
            <div key={file.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex items-start gap-4 hover:shadow-lg transition-all group">
              <div className="w-16 h-16 shrink-0 bg-slate-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:scale-110 transition-all">
                {getFileIcon(file.mime_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-lg truncate" title={file.filename}>{file.filename}</h3>
                <p className="text-sm font-medium text-slate-400 mb-4">{formatBytes(file.file_size_bytes)} &bull; {file.mime_type}</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePreview(file)}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 px-3 rounded-xl transition-colors flex gap-2 items-center"
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <button 
                    onClick={() => handleDownload(file)}
                    className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 py-2 px-3 rounded-xl transition-colors flex gap-2 items-center"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 border-dashed">
              No secure files uploaded yet.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map(file => (
                <tr key={file.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="text-indigo-500 group-hover:scale-110 transition-transform">
                        {React.cloneElement(getFileIcon(file.mime_type), { size: 20 })}
                      </div>
                      <span className="font-bold text-slate-800 line-clamp-1 truncate max-w-xs">{file.filename}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-medium text-slate-500">{formatBytes(file.file_size_bytes)}</span>
                  </td>
                  <td className="p-5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{file.mime_type}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-3 text-slate-400">
                      <button onClick={() => handlePreview(file)} className="p-1 hover:text-indigo-600 transition-colors" title="Preview"><Eye size={18} /></button>
                      <button onClick={() => handleDownload(file)} className="p-1 hover:text-indigo-600 transition-colors" title="Download"><Download size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500 font-medium">No files found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog.Root open={!!previewFile} onOpenChange={(open) => !open && closePreview()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-[2.5rem] shadow-2xl w-full max-w-4xl border border-slate-100 outline-none max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <Dialog.Title className="text-xl font-bold truncate max-w-md">{previewFile?.filename}</Dialog.Title>
                <p className="text-sm text-slate-400 font-medium">{previewFile?.mime_type} &bull; {previewFile && formatBytes(previewFile.file_size_bytes)}</p>
              </div>
              <Dialog.Close className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></Dialog.Close>
            </div>
            
            <div className="flex-1 min-h-0 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100">
              {isPreviewLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                  <p className="text-slate-500 font-bold">Decrypting secure file...</p>
                </div>
              ) : previewUrl ? (
                previewFile?.mime_type.includes('image') ? (
                  <img src={previewUrl} alt={previewFile.filename} className="max-w-full max-h-full object-contain" />
                ) : previewFile?.mime_type.includes('pdf') ? (
                  <iframe src={previewUrl} className="w-full h-150 border-none" title="PDF Preview" />
                ) : previewFile?.mime_type.includes('video') ? (
                  <video src={previewUrl} controls className="max-w-full max-h-full" />
                ) : previewFile?.mime_type.includes('text') || previewFile?.mime_type.includes('json') ? (
                  <iframe src={previewUrl} className="w-full h-full border-none bg-white p-4" title="Text Preview" />
                ) : (
                  <div className="text-center p-8">
                    <FileIcon size={64} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 font-bold mb-4">Preview not available for this file type.</p>
                    <button 
                      onClick={() => handleDownload(previewFile)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Download size={18} /> Download Instead
                    </button>
                  </div>
                )
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </Layout>
  );
};

export default Files;
