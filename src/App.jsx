import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import UploadPage from './components/UploadPage';
import ViewerPage from './components/ViewerPage';

function App() {
  const [currentPage, setCurrentPage] = useState('upload'); // 'upload' or 'viewer'
  const [files, setFiles] = useState(null);
  const [allFilesData, setAllFilesData] = useState({});
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState(''); // Add state for selected file name
  const [selectedFileFullPath, setSelectedFileFullPath] = useState(''); // State for the full path of the selected file
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
        setSelectedFileContent('');

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
      setSelectedFileContent('');

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
      setCurrentPage('upload'); // Stay on upload page if error
    }
  };

  const handleFileSelect = useCallback(
    (filePath) => {
      const fileData = allFilesData[filePath];
      if (fileData && fileData.content) {
        setSelectedFileContent(fileData.content);
        setSelectedFileName(fileData.name); // Set the selected file name
        setSelectedFileFullPath(filePath); // Set the full path
      } else if (fileData && fileData.blob) {
        setSelectedFileContent(
          `Binary file: ${fileData.name}. Preview not available for this type directly in markdown view.`
        );
        setSelectedFileName(fileData.name); // Also set name for binary files
        setSelectedFileFullPath(filePath); // Set the full path for binary files too
      }
    },
    [allFilesData]
  );

  const handleBackToUpload = () => {
    setFiles(null);
    setAllFilesData({});
    setSelectedFileContent('');
    setSelectedFileName(''); // Reset selected file name
    setSelectedFileFullPath(''); // Reset full path
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
      files={files}
      allFilesData={allFilesData}
      selectedFileContent={selectedFileContent}
      selectedFileName={selectedFileName} // Pass selectedFileName to ViewerPage
      selectedFileFullPath={selectedFileFullPath} // Pass full path
      onFileSelect={handleFileSelect}
      onBackToUpload={handleBackToUpload}
    />
  );
}

export default App;
