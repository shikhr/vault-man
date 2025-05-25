import React from 'react';
import Tabs from 'rc-tabs';
import 'rc-tabs/assets/index.css';
import MarkdownRenderer from './MarkdownRenderer';
import { XMarkIcon } from '@heroicons/react/24/solid';

function TabView({
  openFiles,
  activeKey,
  onTabChange,
  onTabClose,
  allFilesData,
}) {
  if (!openFiles || openFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800 text-gray-500">
        No files open. Select a file from the explorer.
      </div>
    );
  }

  const tabItems = openFiles.map((file) => ({
    key: file.path,
    label: (
      <span
        className={`flex items-center font-medium select-none p-0.5 py-1 rounded-t-2xl text-base  justify-between ${
          file.path === activeKey
            ? 'text-white  bg-[#1e1e1e]'
            : 'text-gray-300 hover:text-gray-100'
        }`}
      >
        <span
          className={`p-1 rounded transition-all flex justify-center items-center ${
            file.path === activeKey ? '' : 'hover:bg-gray-600'
          }`}
        >
          {file.name}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(file.path);
            }}
            className={`ml-2 transition-all p-0.5 rounded text-gray-400 hover:text-white ${
              file.path === activeKey
                ? 'hover:bg-gray-600 border-none'
                : 'hover:bg-gray-600'
            }`}
            aria-label={`Close ${file.name}`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </span>
      </span>
    ),
    children: (
      <div className="h-full overflow-y-auto bg-[#1e1e1e]">
        <MarkdownRenderer
          fileContent={file.content}
          fileName={file.name}
          fileFullPath={file.path}
          files={allFilesData}
        />
      </div>
    ),
  }));

  return (
    <div className="flex-1 flex flex-col bg-[#363636] text-gray-100 h-full overflow-hidden">
      <Tabs
        activeKey={activeKey}
        onChange={onTabChange}
        items={tabItems}
        moreIcon={<span>...</span>}
      />
    </div>
  );
}

export default TabView;
