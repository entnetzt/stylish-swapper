import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  label: string;
  className?: string;
  previewUrl?: string;
}

const ImageUpload = ({ onImageSelect, label, className, previewUrl }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors',
          'hover:border-fashion-accent hover:bg-gray-50',
          isDragActive ? 'border-primary bg-gray-50' : 'border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-64 object-cover rounded-md"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xs text-gray-400 mt-2">Drag & drop or click to select</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;