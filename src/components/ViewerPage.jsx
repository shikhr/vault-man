import React from 'react';
import FileTree from './FileTree';
import TabView from './TabView'; // Import TabView

function ViewerPage({
  files, // For FileTree
  allFilesData, // For TabView -> MarkdownRenderer
  openFiles, // For TabView
  activeTabKey, // For TabView
  onFileSelect, // For FileTree
  onTabChange, // For TabView
  onTabClose, // For TabView
  onTabDragEnd, // For TabView
  // onBackToUpload, // This prop seems to be passed from App.jsx but not used here, can be added if needed for a back button
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header can be added back if needed */}
      <main className="flex flex-1 overflow-hidden">
        <FileTree files={files} onFileSelect={onFileSelect} />
        <TabView
          openFiles={openFiles}
          activeKey={activeTabKey}
          onTabChange={onTabChange}
          onTabClose={onTabClose}
          onTabDragEnd={onTabDragEnd}
          allFilesData={allFilesData} // Pass allFilesData to TabView
        />
        {/* MarkdownRenderer is no longer directly rendered here
        <MarkdownRenderer
          fileContent={selectedFileContent} // This logic is now within TabView
          fileName={selectedFileName} 
          fileFullPath={selectedFileFullPath}
          files={allFilesData}
        />
        */}
      </main>
    </div>
  );
}

export default ViewerPage;
