import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Camera, FileImage } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage?: File | null;
  isProcessing?: boolean;
  maxSizeBytes?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  selectedImage,
  isProcessing = false,
  maxSizeBytes = 16 * 1024 * 1024, // 16MB
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          alert(
            `File is too large. Maximum size is ${
              maxSizeBytes / (1024 * 1024)
            }MB`
          );
        } else if (
          rejection.errors.some((e: any) => e.code === "file-invalid-type")
        ) {
          alert("Please upload a valid image file (PNG, JPG, JPEG, GIF)");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onImageSelect(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect, maxSizeBytes]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      },
      maxSize: maxSizeBytes,
      multiple: false,
      disabled: isProcessing,
    });

  const handleRemove = () => {
    onImageRemove();
    setPreview(null);
  };

  const getBorderColor = () => {
    if (isDragReject) return "border-red-300";
    if (isDragActive) return "border-primary-400";
    if (selectedImage) return "border-green-300";
    return "border-gray-300";
  };

  const getBackgroundColor = () => {
    if (isDragReject) return "bg-red-50";
    if (isDragActive) return "bg-primary-50";
    if (selectedImage) return "bg-green-50";
    return "bg-gray-50";
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 hover:border-primary-400 hover:bg-primary-50
            ${getBorderColor()} ${getBackgroundColor()}
            ${isProcessing ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {isDragActive ? (
                <Camera className="w-8 h-8 text-primary-600" />
              ) : (
                <Upload className="w-8 h-8 text-primary-600" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isDragActive ? "Drop your image here" : "Upload Fashion Image"}
              </h3>
              <p className="text-gray-600 mt-1">
                {isDragActive
                  ? "Release to upload your fashion item"
                  : "Drag & drop or click to select an image"}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              <p>Supports: PNG, JPG, JPEG, GIF, WebP</p>
              <p>Max size: {maxSizeBytes / (1024 * 1024)}MB</p>
            </div>

            {!isDragActive && (
              <Button variant="outline" className="mx-auto">
                <FileImage className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            )}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="aspect-square relative">
            {preview && (
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Processing...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedImage.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUpload;
