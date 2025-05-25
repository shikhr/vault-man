import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import UploadPage from './components/UploadPage';
import ViewerPage from './components/ViewerPage';

function App() {
  const [currentPage, setCurrentPage] = useState('upload'); // 'upload' or 'viewer'
  const [files, setFiles] = useState(null); // This is the file tree structure
  const [allFilesData, setAllFilesData] = useState({}); // Flat map of all file data by path

  // New state for tab management
  const [openFiles, setOpenFiles] = useState([]); // Array of file objects { path, name, content, blob }
  const [activeTabKey, setActiveTabKey] = useState(null); // Path of the active file

  const [error, setError] = useState('');

  const processFile = async (file) => {
    const path = file.webkitRelativePath || file.name;
    const name = file.name;
    let content = null;
    let blob = null;

    if (name.endsWith('.md')) {
      content = await file.text();
    } else if (name.match(/\.(png|jpg|jpeg|gif)$/i)) {
      blob = file;
    }
    return { name, path, content, blob, type: 'file' };
  };

  const buildFileTree = (fileList) => {
    const tree = {};
    fileList.forEach((file) => {
      const parts = file.path.split('/');
      let currentLevel = tree;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          currentLevel[part] = { ...file, type: 'file' };
        } else {
          // It's a folder
          if (!currentLevel[part]) {
            currentLevel[part] = { type: 'folder', children: {} };
          }
          currentLevel = currentLevel[part].children;
        }
      });
    });
    return tree;
  };

  const handleZipUpload = async (event) => {
    setError('');
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (uploadedFile.name.endsWith('.zip')) {
      try {
        // Reset state before processing new file
        setFiles(null);
        setAllFilesData({});
        setOpenFiles([]); // Reset open files
        setActiveTabKey(null); // Reset active tab

        const zip = await JSZip.loadAsync(uploadedFile);
        const extractedFiles = [];
        const fileDataMap = {};

        for (const relativePath in zip.files) {
          if (!zip.files[relativePath].dir) {
            const fileEntry = zip.files[relativePath];
            const name = relativePath.split('/').pop();
            let content = null;
            let blob = null;

            if (name.endsWith('.md')) {
              content = await fileEntry.async('string');
            } else if (name.match(/\.(png|jpg|jpeg|gif)$/i)) {
              blob = await fileEntry.async('blob');
            }
            const fileDetail = {
              name,
              path: relativePath,
              content,
              blob,
              type: 'file',
            };
            extractedFiles.push(fileDetail);
            fileDataMap[relativePath] = fileDetail;
          }
        }
        setAllFilesData(fileDataMap);
        setFiles(buildFileTree(extractedFiles));
        setCurrentPage('viewer');
      } catch (e) {
        console.error('Error processing zip file:', e);
        setError('Error processing ZIP file. Make sure it is a valid zip.');
        setCurrentPage('upload'); // Stay on upload page if error
      }
    } else {
      setError('Please upload a .zip file.');
    }
  };

  const handleFolderUploadEvent = async (event) => {
    setError('');
    const items = event.target.files;
    if (!items || items.length === 0) return;

    try {
      // Reset state before processing new folder
      setFiles(null);
      setAllFilesData({});
      setOpenFiles([]); // Reset open files
      setActiveTabKey(null); // Reset active tab

      const processedFilesList = [];
      const fileDataMap = {};

      for (let i = 0; i < items.length; i++) {
        const file = items[i];
        if (file.webkitRelativePath) {
          const fileDetail = await processFile(file);
          processedFilesList.push(fileDetail);
          fileDataMap[fileDetail.path] = fileDetail;
        }
      }

      if (processedFilesList.length === 0) {
        setError(
          "Could not read folder contents. Ensure you're selecting a folder and your browser supports it."
        );
        setCurrentPage('upload'); // Stay on upload page if error
        return;
      }

      setAllFilesData(fileDataMap);
      setFiles(buildFileTree(processedFilesList));
      setCurrentPage('viewer');
    } catch (e) {
      console.error('Error processing folder:', e);
      setError('Error processing folder.');
      setOpenFiles([]); // Clear on error
      setActiveTabKey(null); // Clear on error
      setCurrentPage('upload'); // Stay on upload page if error
    }
  };

  const handleFileSelect = useCallback(
    (filePath) => {
      const fileData = allFilesData[filePath];
      if (fileData) {
        // Check if the file is already open
        const isOpen = openFiles.some((f) => f.path === filePath);
        if (!isOpen) {
          // Add to open files if it's a viewable file (has content or is a known blob type)
          if (fileData.content || fileData.blob) {
            setOpenFiles((prevOpenFiles) => [...prevOpenFiles, fileData]);
          } else {
            // Handle case where file is not viewable (e.g. unknown binary)
            // Optionally, you could add it to openFiles and let TabView show a message
            console.warn(
              `File ${filePath} is not viewable and won't be opened in a tab.`
            );
            // If you still want to "select" it without opening, you might need other state.
            // For now, we just don't open it.
            return;
          }
        }
        // Set as active tab
        setActiveTabKey(filePath);
      }
    },
    [allFilesData, openFiles]
  );

  const handleTabChange = (newKey) => {
    setActiveTabKey(newKey);
  };

  const handleTabClose = (targetKey) => {
    setOpenFiles((prevOpenFiles) => {
      const newOpenFiles = prevOpenFiles.filter((f) => f.path !== targetKey);
      if (activeTabKey === targetKey) {
        if (newOpenFiles.length > 0) {
          // Activate the last tab in the list, or the first if you prefer
          setActiveTabKey(newOpenFiles[newOpenFiles.length - 1].path);
        } else {
          setActiveTabKey(null); // No tabs left
        }
      }
      return newOpenFiles;
    });
  };

  // Placeholder for drag-end, rc-tabs might handle this internally or need react-dnd
  const handleTabDragEnd = (newOrder) => {
    // This would be called by rc-tabs if it supports a callback for drag end.
    // The `newOrder` would likely be an array of keys in the new order.
    // You would then reorder `openFiles` based on this.
    // For now, this is a conceptual placeholder.
    // Example: setOpenFiles(newOrder.map(key => openFiles.find(f => f.path === key)));
    console.log('Tab drag end, new order:', newOrder);
    // If rc-tabs provides the full items in new order:
    // setOpenFiles(newOrder);
  };

  const handleBackToUpload = () => {
    setFiles(null);
    setAllFilesData({});
    setOpenFiles([]); // Reset open files
    setActiveTabKey(null); // Reset active tab
    setError('');
    setCurrentPage('upload');
  };

  if (currentPage === 'upload') {
    return (
      <UploadPage
        onZipUpload={handleZipUpload}
        onFolderUpload={handleFolderUploadEvent}
        error={error}
      />
    );
  }

  return (
    <ViewerPage
      files={files} // File tree structure
      allFilesData={allFilesData} // All file data for content lookup
      openFiles={openFiles} // Files currently open in tabs
      activeTabKey={activeTabKey} // Key of the active tab
      onFileSelect={handleFileSelect}
      onTabChange={handleTabChange}
      onTabClose={handleTabClose}
      onTabDragEnd={handleTabDragEnd} // Pass drag end handler
      onBackToUpload={handleBackToUpload}
    />
  );
}

export default App;
