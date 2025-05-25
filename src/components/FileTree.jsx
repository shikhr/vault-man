import React, { useState } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline'; // Using Heroicons for better icons

function FileTree({ files, onFileSelect }) {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const renderTree = (nodes, currentPath = '', level = 0) => {
    return (
      <ul className={`pl-${level * 2}`}>
        {' '}
        {/* Indentation based on level */}
        {Object.entries(nodes).map(([name, node]) => {
          const nodePath = currentPath ? `${currentPath}/${name}` : name;
          if (node.type === 'folder') {
            const isExpanded = expandedFolders[nodePath];
            return (
              <li key={nodePath} className="my-1">
                <div
                  onClick={() => toggleFolder(nodePath)}
                  className="flex items-center cursor-pointer hover:bg-gray-700 p-1 rounded"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 mr-1 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 mr-1 text-gray-400" />
                  )}
                  {isExpanded ? (
                    <FolderOpenIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  ) : (
                    <FolderIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-300 select-none">
                    {name}
                  </span>
                </div>
                {isExpanded && renderTree(node.children, nodePath, level + 1)}
              </li>
            );
          }
          return (
            <li key={nodePath} className="my-1">
              <div
                onClick={() => onFileSelect(node.path)}
                className="flex items-center cursor-pointer hover:bg-gray-700 p-1 rounded pl-3" // Indent files slightly more
              >
                <DocumentIcon className="h-5 w-5 mr-2 text-blue-400" />
                <span className="text-sm text-gray-300 select-none">
                  {name}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="shrink-0 w-72 bg-[#262626] border-r border-gray-700 p-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      <h4 className="text-md font-semibold text-gray-200 mt-1 mb-3 pb-2 border-b border-gray-700 select-none">
        File Explorer
      </h4>
      {files ? (
        renderTree(files)
      ) : (
        <p className="text-sm text-gray-500">Upload a vault to see files.</p>
      )}
    </div>
  );
}

export default FileTree;
