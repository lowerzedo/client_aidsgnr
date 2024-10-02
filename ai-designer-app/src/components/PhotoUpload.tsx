"use client";
import React, { useState } from "react";
import axios from "axios";
import { Upload, X } from "lucide-react";

const PhotoUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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
      alert("Please select at least one photo to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`photo${index + 1}`, file);
    });

    try {
      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Photos uploaded successfully!");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Error uploading photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-400">
        AI Room Layout
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
            <div className="flex flex-col items-center justify-center pt-5 pb-6 pl-4 pr-4">
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
        {uploading ? "Uploading..." : "Upload Photos"}
      </button>
    </div>
  );
};

export default PhotoUpload;
