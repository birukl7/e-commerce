import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
  currentImage?: string;
  className?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in bytes
}

export default function ImageUpload({
  onFileSelect,
  currentImage,
  className = '',
  label = 'Upload Image',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload an image file.');
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file);
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, [onFileSelect, maxSize]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize,
    multiple: false,
  });

  const removeImage = () => {
    setPreview(null);
    setError('');
    onFileSelect(null);
  };

  const displayImage = preview || currentImage;

  return (
    <div className={cn('space-y-4', className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isDragActive && !isDragReject ? 'border-primary bg-primary/5' : 'border-gray-300',
          isDragReject ? 'border-red-400 bg-red-50' : '',
          displayImage ? 'border-solid border-gray-200 bg-gray-50' : ''
        )}
      >
        <input {...getInputProps()} />
        
        {displayImage ? (
          <div className="relative">
            <img
              src={displayImage}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Click or drag to replace image
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {isDragActive ? (
                <Upload className="h-full w-full" />
              ) : (
                <ImageIcon className="h-full w-full" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {currentImage && !preview && (
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            Current: {currentImage.split('/').pop()}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
