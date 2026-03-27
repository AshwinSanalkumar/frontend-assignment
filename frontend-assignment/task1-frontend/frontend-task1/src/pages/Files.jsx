import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles, uploadFile } from '../store/fileSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '../context/ToastContext';
import { Plus, X, File as FileIcon, Link as LinkIcon, Download, Copy, UploadCloud, ImageIcon, FileText, FileBadge, Film } from 'lucide-react';
import api from '../api/axios';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Share state
  const [shareFileProps, setShareFileProps] = useState(null); // File object being shared
  const [shareDuration, setShareDuration] = useState(5);
  const [generatedLink, setGeneratedLink] = useState('');

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

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/files/${shareFileProps.id}/generate-link/`, {
        duration_minutes: shareDuration
      });
      
      const backendUrl = res.data.download_url;
      const tokenMatches = backendUrl.match(/\/download\/([^/]+)/);
      const token = tokenMatches ? tokenMatches[1] : '';
      const frontendLink = `${window.location.origin}/download/${token}`;
      
      setGeneratedLink(frontendLink);
      addToast({ title: 'Link Generated', description: 'Your secure sharing link is ready.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', description: err?.response?.data?.error || 'Failed to generate link.', type: 'error' });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    addToast({ title: 'Copied!', description: 'Link copied to clipboard.', type: 'success' });
  };

  return (
    <Layout>
      <Navbar title="Secure Documents" description="Manage and share your protected files securely using timed links.">
        <Dialog.Root open={openUpload} onOpenChange={setOpenUpload}>
          <Dialog.Trigger asChild>
            <button 
              onClick={() => setSelectedFile(null)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all">
              <UploadCloud size={20} /> Upload File
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
              
              <button 
                onClick={() => {
                  setShareFileProps(file);
                  setGeneratedLink('');
                  setShareDuration(5);
                }}
                className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 px-4 rounded-xl transition-colors flex gap-2 items-center"
              >
                <LinkIcon size={16} /> Share Link
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 border-dashed">
            No secure files uploaded yet.
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog.Root open={!!shareFileProps} onOpenChange={(open) => !open && setShareFileProps(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 outline-none">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-2xl font-bold">Generate Secure Link</Dialog.Title>
              <Dialog.Close className="text-slate-400"><X size={24} /></Dialog.Close>
            </div>
            
            {generatedLink ? (
              <div className="space-y-6">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl font-medium border border-emerald-100 text-sm">
                  Success! This secure link will automatically expire in {shareDuration} minutes. Only authorized users with this exact link can download the file.
                </div>
                
                <div className="relative group">
                  <input 
                    readOnly 
                    value={generatedLink}
                    className="w-full p-4 pr-16 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-medium text-slate-600"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => {
                      setShareFileProps(null);
                      setGeneratedLink('');
                    }}
                    className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateLink} className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Selected File</p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold truncate">
                    {shareFileProps?.filename}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500 mb-2 block">Link Expiration (Minutes)</label>
                  <select 
                    value={shareDuration} 
                    onChange={(e) => setShareDuration(Number(e.target.value))}
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={1440}>24 Hours</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-2 hover:bg-indigo-700 shadow-lg flex justify-center items-center gap-2 transition-all"
                >
                  <LinkIcon size={20} /> Generate Download URL
                </button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </Layout>
  );
};

export default Files;
