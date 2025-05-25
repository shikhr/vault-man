import React from 'react';

function UploadPage({ onZipUpload, onFolderUpload, error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-gray-100 p-4">
      <div className="bg-gray-700 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Obsidian Vault Viewer
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Upload your Obsidian vault to get started.
        </p>

        <div className="mb-6">
          <label
            htmlFor="zip-upload"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Upload .zip Vault:
          </label>
          <input
            type="file"
            id="zip-upload"
            accept=".zip"
            onChange={onZipUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="folder-upload"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Or Upload Folder:
          </label>
          <input
            type="file"
            id="folder-upload"
            webkitdirectory=""
            directory=""
            onChange={onFolderUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 cursor-pointer"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}
      </div>
      <footer className="text-center text-gray-500 mt-8 text-sm">
        <p>
          Select a .zip file of your Obsidian vault or the vault folder itself.
        </p>
      </footer>
    </div>
  );
}

export default UploadPage;
