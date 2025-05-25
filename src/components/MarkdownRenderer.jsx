import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MarkdownRenderer({ fileContent }) {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    if (fileContent) {
      // Basic image handling for ![[image.png]] style links
      // This will need to be more robust for actual use
      const processedContent = fileContent.replace(
        /!\\[\\[(.*?)\\]\\]/g,
        (match, imageName) => {
          // This is a placeholder. In a real scenario, you'd find the image
          // in `files` and create a URL.
          // For now, let's assume images are in a public/images folder or similar
          // or convert blob to URL if available in a more complex setup.
          return `![](${imageName})`; // Simplistic replacement
        }
      );
      setMarkdown(processedContent);
    } else {
      setMarkdown('');
    }
  }, [fileContent]);

  return (
    <div className="grow-1 p-6 px-20 overflow-y-auto bg-[#1e1e1e] text-[#dadada] prose prose-invert max-w-none prose-sm sm:prose-base scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {markdown ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-lg">
            Select a Markdown file to view its content.
          </p>
        </div>
      )}
    </div>
  );
}

export default MarkdownRenderer;
