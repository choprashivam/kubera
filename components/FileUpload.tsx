"use client";
import React, { useRef, useState } from 'react';
import { api } from '~/trpc/react';

interface FileUploadProps {
    importType: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ importType }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseCsvMutation = api.fileImport.parseCsv.useMutation({
        onSuccess: (data) => {
            setIsUploading(false);
            setMessage({ type: 'success', text: 'Upload successful' });
            console.log('Upload successful:', data);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedFile(null);
        },
        onError: (error) => {
            setIsUploading(false);
            setMessage({ type: 'error', text: `Upload error: ${error.message}` });
            console.error('Upload error:', error.message);
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file ?? null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage({ type: 'error', text: 'No file selected' });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvContent = e.target?.result as string;
            if (csvContent) {
                try {
                    await parseCsvMutation.mutateAsync({ csvContent, importType });
                } catch (error) {
                    console.error("Error parsing CSV:", error);
                }
            }
        };
        reader.readAsText(selectedFile);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
            <label className="mb-4 text-lg font-semibold text-gray-700">
                Select CSV File for {importType}
            </label>
            <div className="flex items-center justify-between w-full mb-4">
                <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    ref={fileInputRef}
                    className="block w-2/3 text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`px-4 py-2 rounded-full text-white font-semibold w-1/3
              ${isUploading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {isUploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
            {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                    Selected file: {selectedFile.name}
                </p>
            )}
            {message && (
                <p className={`mt-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default FileUpload;