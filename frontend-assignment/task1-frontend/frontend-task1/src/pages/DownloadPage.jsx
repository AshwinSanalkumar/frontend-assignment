import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Package, XCircle, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const DownloadPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // loading, success, used, expired, invalid
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const downloadFile = async () => {
      try {
        const res = await api.get(`/file/download/${token}/`, {
          responseType: 'blob', // Important: we expect a file blob
        });

        // The backend returns Content-Disposition header with filename
        const contentDisposition = res.headers['content-disposition'];
        let filename = 'downloaded_file';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch.length === 2) {
            filename = filenameMatch[1];
          }
        }

        // Trigger the actual download in the browser
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setStatus('success');
      } catch (err) {
        // Axios wraps blob errors differently sometimes, but let's try to get status
        const statusCode = err.response?.status;
        
        let errorData = null;
        if (err.response?.data instanceof Blob) {
           errorData = JSON.parse(await err.response.data.text());
        } else {
           errorData = err.response?.data;
        }

        const msg = errorData?.error || 'An error occurred while downloading.';
        
        if (statusCode === 410) {
          setStatus('used');
          setErrorMessage(msg);
        } else if (statusCode === 404) {
          setStatus('expired');
          setErrorMessage(msg);
        } else {
          setStatus('invalid');
          setErrorMessage(msg);
        }
      }
    };

    downloadFile();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 transform scale-100 transition-all">
        
        <div className="mb-8 flex justify-center">
          <div className="bg-slate-100 p-4 rounded-3xl">
            <Package size={48} className="text-indigo-600" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="animate-pulse">
            <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-6" />
            <h1 className="text-2xl font-black text-slate-800 mb-2">Fetching Secure File...</h1>
            <p className="text-slate-500 font-medium">Please wait while we establish a secure connection.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-slate-800 mb-3">Download Started!</h1>
            <p className="text-slate-500 font-medium mb-8">
              Your file is securely downloading. For security reasons, this link has now been permanently disabled.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold transition-colors w-full"
            >
              Go to Homepage
            </button>
          </div>
        )}

        {status === 'used' && (
          <div>
            <XCircle size={64} className="text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-slate-800 mb-3">Link Already Used</h1>
            <p className="text-slate-600 font-medium mb-2 leading-relaxed">
              {errorMessage || "This link has already been used and is no longer valid."}
            </p>
            <p className="text-sm text-slate-400 font-medium mb-8">
              Secure links can only be accessed exactly once to ensure data privacy. Please request a new link from the owner.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold transition-colors w-full shadow-lg"
            >
              Return Home
            </button>
          </div>
        )}

        {(status === 'expired' || status === 'invalid') && (
          <div>
            <AlertTriangle size={64} className="text-orange-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-slate-800 mb-3">Invalid Link</h1>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed">
              {errorMessage || "This link may have expired or is incorrectly formatted. Please request a new generated link."}
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold transition-colors w-full"
            >
              Go to Homepage
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DownloadPage;
