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
      {/* Header can be added back if needed */}
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
