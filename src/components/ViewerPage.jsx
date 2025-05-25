import React from 'react';
import FileTree from './FileTree';
import MarkdownRenderer from './MarkdownRenderer';

function ViewerPage({
  files,
  allFilesData,
  selectedFileContent,
  selectedFileName, // Add selectedFileName prop
  selectedFileFullPath, // Add selectedFileFullPath prop
  onFileSelect,
  onBackToUpload,
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header can be added back if needed */}
      <main className="flex flex-1 overflow-hidden">
        <FileTree files={files} onFileSelect={onFileSelect} />
        <MarkdownRenderer
          fileContent={selectedFileContent}
          fileName={selectedFileName} // Pass selectedFileName to MarkdownRenderer
          fileFullPath={selectedFileFullPath} // Pass full path to MarkdownRenderer
          files={allFilesData}
        />
      </main>
    </div>
  );
}

export default ViewerPage;
