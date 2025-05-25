import React from 'react';
import FileTree from './FileTree';
import MarkdownRenderer from './MarkdownRenderer';

function ViewerPage({
  files,
  allFilesData,
  selectedFileContent,
  onFileSelect,
  onBackToUpload,
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* <header className="bg-gray-800 shadow-md p-3 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-semibold text-white">
          Obsidian Vault Viewer
        </h1>
        <button
          onClick={onBackToUpload}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150"
        >
          Upload New Vault
        </button>
      </header> */}
      <main className="flex flex-1 overflow-hidden">
        <FileTree files={files} onFileSelect={onFileSelect} />
        <MarkdownRenderer
          fileContent={selectedFileContent}
          files={allFilesData}
          onLinkClick={onFileSelect}
        />
      </main>
    </div>
  );
}

export default ViewerPage;
