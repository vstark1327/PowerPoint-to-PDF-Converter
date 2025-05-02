'use client'
import { FC, useCallback, useState } from 'react';
import { LoadingIndicatorIcon } from '@/icons/LoadingIndicatorIcon';
import UploadIcon from '@/icons/UploadIcon';

type HandleFileProps = {
    file: File,
    onCancel: () => void,
    onConverted: (downloadURL: string) => void
};

export const HandleFile: FC<HandleFileProps> = ({file, onCancel, onConverted}) => {

    const [isConverting, setIsConverting] = useState(false);
    

    const handleConvert = async () => {
        setIsConverting(true);
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
          const uploadRes = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData,
          });
    
          const { job_id } = await uploadRes.json();
    
          const interval = setInterval(async () => {
            try {
                const statusRes = await fetch(`http://localhost:8000/status/${job_id}`);
                const { status } = await statusRes.json();
        
                if (status === 'done') {
                clearInterval(interval);
                try {
                    const downloadRes = await fetch(`http://localhost:8000/download/${job_id}`);
                    if (!downloadRes.ok) {
                        throw new Error('Failed to fetch download URL');
                      }
                    const result = await downloadRes.json();
                    // console.log("Result from Server: ", result);
                    if (result.error || !result.url) {
                        throw new Error(result.error || 'Invalid response from server');
                      }
                    // console.log('S3 URL:', result.url);
                    onConverted(result.url);
                } catch (downloadErr) {
                    console.error('Error during download:', downloadErr);
                    alert('Failed to get download URL.');
                    setIsConverting(false);
                  }
                } else if (status === 'error') {
                clearInterval(interval);
                alert('Conversion failed.');
                setIsConverting(false);
                }
            } catch (err) {
                console.error('Error while polling status/download:', err);
                clearInterval(interval);
                alert('An error occurred while checking the conversion status.');
                setIsConverting(false);
              }
          }, 2000);
        } catch (err) {
          console.error(err);
          alert('Something went wrong while sending the file to backend: '+ err);
          setIsConverting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-md">
            {/* File info block */}
            <div className="flex w-full flex-col gap-1 rounded-lg border border-gray-300 p-4 text-center">
            <p className="text-lg font-semibold text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            {/* Radio/Progress UI */}
            {!isConverting ? (
            <>
                <label className="group flex cursor-pointer gap-2 rounded-xl border-2 border-blue-200 bg-blue-25 p-4">
                    <input className="hidden" type="radio" checked name="compression" readOnly />
                    <div>
                    <div className="grid size-4 place-items-center rounded-full border border-blue-600">
                        <div className="h-2 w-2 rounded-full bg-blue-600 transition-opacity"></div>
                    </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                    <span className="text-sm leading-4 text-blue-800">Convert to PDF</span>
                    <span className="text-sm text-blue-700">Best quality, retains images and assets.</span>
                    </div>
                </label>
                <div className="flex w-full gap-3">
                    <button
                        type="button"
                        title="Cancel"
                        onClick={onCancel}
                        disabled={isConverting}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 font-semibold text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        title="Convert this PowerPoint document to PDF"
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="flex w-full items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Convert
                    </button>
                </div>
            </>
            ) : (
                <>
                {/* Compressing message with spinner */}
                <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <svg className="spinner h-5 w-5 mr-2" viewBox="0 0 50 50">
                        <circle
                        className="path"
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="4"
                        />
                    </svg>
                    <span className="text-sm text-gray-700">Converting your file...</span>
                </div>
            
                {/* Disabled buttons */}
                <div className="flex w-full gap-3">
                    <button
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-400 shadow-sm cursor-not-allowed"
                    >
                    Cancel
                    </button>
                    <button
                    disabled className="w-full flex items-center justify-center rounded-lg border border-blue-200 bg-blue-100 px-4 py-2.5 font-semibold text-blue-600 shadow-sm cursor-not-allowed">
                    <LoadingIndicatorIcon className="w-4 h-4 mr-2" />
                    </button>
                </div>
                </>
            )}
        </div>
    )
};