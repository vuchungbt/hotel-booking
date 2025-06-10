import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Link } from 'lucide-react';
import FileUpload from './FileUpload';
import { UploadResponse } from '../../services/api';

interface ImageUploadSectionProps {
  title?: string;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  uploadType?: 'image' | 'hotel-image' | 'room-image';
  errors?: { imageUrl?: string };
  required?: boolean;
  className?: string;
}

type UploadMethod = 'file' | 'url';

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  title = 'Hình ảnh',
  imageUrl,
  onImageUrlChange,
  uploadType = 'hotel-image',
  errors = {},
  required = false,
  className = ''
}) => {
  const [activeMethod, setActiveMethod] = useState<UploadMethod>('file');
  const [urlInputValue, setUrlInputValue] = useState(imageUrl);

  // Sync URL input with prop changes
  useEffect(() => {
    setUrlInputValue(imageUrl);
  }, [imageUrl]);

  // Handle upload success
  const handleUploadSuccess = (url: string, uploadData?: UploadResponse) => {
    onImageUrlChange(url);
  };

  // Handle URL input change
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlInputValue(value);
    onImageUrlChange(value);
  };

  // Validate URL format
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid if not required
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
  };

  const urlError = errors.imageUrl || (!isValidImageUrl(urlInputValue) && urlInputValue ? 'URL hình ảnh không hợp lệ' : '');

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 ${className}`}>
      <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
        <ImageIcon className="mr-3 text-indigo-600" size={24} />
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h2>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveMethod('file')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeMethod === 'file'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload size={16} className="mr-2" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveMethod('url')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeMethod === 'url'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link size={16} className="mr-2" />
          Paste URL
        </button>
      </div>

      {/* Content based on active method */}
      {activeMethod === 'file' ? (
        <div className="space-y-4">
          <FileUpload
            onUpload={handleUploadSuccess}
            uploadType={uploadType}
            currentImageUrl={imageUrl}
            maxSize={10} // 10MB for hotels
            className="min-h-[200px]"
          />
          
          {/* Info about file upload */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <ImageIcon size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Upload trực tiếp lên Cloudinary</p>
                <p className="text-blue-700 mt-1">
                  {uploadType === 'hotel-image' 
                    ? 'Hình ảnh sẽ được tối ưu hóa thành 1200x800px cho khách sạn'
                    : uploadType === 'room-image'
                    ? 'Hình ảnh sẽ được tối ưu hóa thành 800x600px cho phòng'
                    : 'Hình ảnh sẽ được tối ưu hóa cho hiển thị tốt nhất'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL hình ảnh {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="url"
              value={urlInputValue}
              onChange={handleUrlInputChange}
              placeholder="https://example.com/hotel-image.jpg"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                urlError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
          </div>

          {/* Preview for URL method */}
          {urlInputValue && !urlError && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src={urlInputValue}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Info about URL method */}
          <div className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Link size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Sử dụng URL từ nguồn bên ngoài</p>
                <p className="text-amber-700 mt-1">
                  Chỉ chấp nhận định dạng: JPG, PNG, GIF, WebP. Đảm bảo URL có thể truy cập công khai.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection; 