import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Import default styles
import {
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'; // Using Heroicons for better icons

function FileTree({ files, onFileSelect }) {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  console.log('FileTree files:', files); // Debugging line to check files structure

  const renderTree = (nodes, currentPath = '', level = 0) => {
    const entries = Object.entries(nodes);

    // Filter out hidden files and folders
    const visibleEntries = entries.filter(([name]) => !name.startsWith('.'));

    // Sort entries: folders first, then files, then alphabetically
    visibleEntries.sort(([nameA, nodeA], [nameB, nodeB]) => {
      if (nodeA.type === 'folder' && nodeB.type !== 'folder') {
        return -1;
      }
      if (nodeA.type !== 'folder' && nodeB.type === 'folder') {
        return 1;
      }
      return nameA.localeCompare(nameB);
    });

    return (
      <ul className="">
        {/* Indentation based on level */}
        {visibleEntries.map(([name, node]) => {
          const nodePath = currentPath ? `${currentPath}/${name}` : name;
          if (node.type === 'folder') {
            const isExpanded = expandedFolders[nodePath];
            return (
              <li key={nodePath} className={`my-1 pl-4`}>
                <div
                  onClick={() => toggleFolder(nodePath)}
                  className={`flex items-center cursor-pointer hover:bg-gray-700 p-1 rounded`}
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 mr-1 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 mr-1 text-gray-400" />
                  )}
                  {isExpanded ? (
                    <FolderOpenIcon className="h-4 w-4 mr-2 text-yellow-500" />
                  ) : (
                    <FolderIcon className="h-4 w-4 mr-2 text-yellow-500" />
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
            <li key={nodePath} className={`my-1 pl-4`}>
              <div
                onClick={() => onFileSelect(node.path)}
                className={`flex items-center cursor-pointer hover:bg-gray-700 p-1 rounded `} // Indent files based on level
              >
                <DocumentTextIcon className="ml-1 h-4 w-4 mr-2 text-gray-400 shrink-0" />
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
    <ResizableBox
      width={380} // Initial width, ResizableBox will manage its state internally
      height={Infinity}
      axis="x"
      minConstraints={[380, Infinity]}
      maxConstraints={[800, Infinity]}
      // No onResizeStop needed for uncontrolled width management by ResizableBox
      className="shrink-0 bg-[#262626] border-r border-gray-700 h-full flex flex-col" // Removed p-3, md:flex-grow, w-auto. Added flex flex-col.
      handle={
        <div className="absolute top-1/2 right-0 w-2 h-full cursor-col-resize bg-gray-500 opacity-50 hover:opacity-100 transform -translate-y-1/2 z-10" /> // Added z-10
      }
    >
      {/* Content wrapper for padding and scrolling */}
      <div className="p-3 h-full overflow-y-auto no-scrollbar">
        <h4 className="text-md font-semibold text-gray-200 mt-1 mb-3 pb-2 border-b border-gray-700 select-none">
          File Explorer
        </h4>
        {files ? (
          renderTree(files)
        ) : (
          <p className="text-sm text-gray-500">Upload a vault to see files.</p>
        )}
      </div>
    </ResizableBox>
  );
}

export default FileTree;
