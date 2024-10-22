"use client";
import React, { useState } from "react";
import axios from "axios";
import { Upload, X } from "lucide-react";

const PhotoUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [layoutImage, setLayoutImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 4) {
      alert("You can only upload up to 4 photos at a time.");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one photo to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();

    // Append all selected files to the FormData
    selectedFiles.forEach((file) => {
      formData.append("image", file);
    });

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/ai/process_image",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
          // Add these options for better error handling and CORS support
          withCredentials: false,
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      if (response.data && response.data.layout_image) {
        setLayoutImage(`data:image/png;base64,${response.data.layout_image}`);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      let errorMessage = "Error processing images. Please try again.";
      
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.response) {
          // Server returned an error response
          errorMessage = error.response.data?.error || error.response.statusText;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "Unable to reach the server. Please check your connection.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-400  mb-6 text-center">
        Photo Upload
      </h1>
      <div className="mb-6">
        <label
          htmlFor="photo-upload"
          className="block mb-2 text-lg font-medium text-gray-700"
        >
          Select up to 4 photos
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center w-full h-80 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-16 h-16 mb-4 text-gray-400" />
              <p className="mb-2 text-xl text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG or GIF (MAX. 4 files)
              </p>
            </div>
            <input
              id="photo-upload"
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading || selectedFiles.length >= 4}
            />
          </label>
        </div>
      </div>
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700 mb-3">
            Selected files:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X size={20} />
                </button>
                <p className="text-sm text-gray-500 truncate mt-2">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 text-lg transition-colors"
      >
        {uploading ? "Processing..." : "Generate Layout"}
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {layoutImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            Generated Layout:
          </h2>
          <img
            src={layoutImage}
            alt="Generated Room Layout"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;