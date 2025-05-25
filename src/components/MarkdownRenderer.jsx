import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS

function MarkdownRenderer({ fileContent, fileName, fileFullPath, files }) {
  const [currentMarkdown, setCurrentMarkdown] = useState('');

  const preprocessedContent = useMemo(() => {
    if (!fileContent) return '';
    return fileContent.replace(
      /!\[\[(.*?)\]\]/g,
      (match, imageName) => `![](${imageName})`
    );
  }, [fileContent]);

  useEffect(() => {
    setCurrentMarkdown(preprocessedContent);
  }, [preprocessedContent]);

  const resolveRelativePath = (currentFullPath, relativePath) => {
    if (!currentFullPath) return relativePath; // Cannot resolve if no base path
    const pathParts = currentFullPath.split('/');
    pathParts.pop(); // Remove filename to get directory

    const relativeParts = relativePath.split('/');
    for (const part of relativeParts) {
      if (part === '..') {
        pathParts.pop(); // Go up a directory
      } else if (part !== '.') {
        pathParts.push(part); // Go into a subdirectory or add filename
      }
    }
    return pathParts.join('/');
  };

  const transformImageUri = useCallback(
    (uri) => {
      if (
        !uri ||
        uri.startsWith('http:') ||
        uri.startsWith('https:') ||
        uri.startsWith('data:') ||
        uri.startsWith('blob:')
      ) {
        return uri;
      }

      const decodedUri = decodeURIComponent(uri);

      // Attempt 1: URI is a full path key in `files` (e.g., "assets/image.png" or "image.png" if it's at root)
      let imageFile = (files || {})[decodedUri];
      if (imageFile && imageFile.blob) {
        try {
          return URL.createObjectURL(imageFile.blob);
        } catch (e) {
          console.error(`Error creating blob URL for path '${decodedUri}':`, e);
          return decodedUri;
        }
      }

      // Attempt 2: URI is relative to the current markdown file's path
      if (fileFullPath) {
        const absolutePath = resolveRelativePath(fileFullPath, decodedUri);
        imageFile = (files || {})[absolutePath];
        if (imageFile && imageFile.blob) {
          try {
            return URL.createObjectURL(imageFile.blob);
          } catch (e) {
            console.error(
              `Error creating blob URL for resolved path '${absolutePath}':`,
              e
            );
            return decodedUri;
          }
        }
      }

      // Attempt 3: URI is a simple filename (e.g., "image.png"), search by name as a fallback.
      if (!decodedUri.includes('/')) {
        const imageFileByName = Object.values(files || {}).find(
          (file) => file.name === decodedUri && file.blob
        );
        if (imageFileByName && imageFileByName.blob) {
          try {
            return URL.createObjectURL(imageFileByName.blob);
          } catch (e) {
            console.error(
              `Error creating blob URL for name '${decodedUri}':`,
              e
            );
            return decodedUri;
          }
        }
      }

      // Attempt 4: Search for a file whose path *ends with* the decodedUri
      // This can help if the markdown uses a partial path that is unique enough
      const matchingKey = Object.keys(files || {}).find((key) =>
        key.endsWith(decodedUri)
      );
      if (matchingKey) {
        imageFile = (files || {})[matchingKey];
        if (imageFile && imageFile.blob) {
          try {
            return URL.createObjectURL(imageFile.blob);
          } catch (e) {
            console.error(
              `Error creating blob URL for suffix match '${matchingKey}':`,
              e
            );
            return decodedUri;
          }
        }
      }

      return decodedUri; // Fallback if not found
    },
    [files, fileFullPath] // Added fileFullPath to dependencies
  );

  if (!fileContent && !fileName) {
    // Show placeholder if no file is selected or content is empty
    return (
      <div className="grow max-w-none h-full p-6 px-30 overflow-y-auto bg-[#1e1e1e] text-[#dadada] prose prose-invert prose-sm sm:prose-base scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-lg">
            Select a Markdown file to view its content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grow max-w-none h-full p-6 px-30 overflow-y-auto bg-[#1e1e1e] text-[#dadada] prose prose-invert prose-sm sm:prose-base scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {fileName && (
        <h1 className="text-2xl font-bold mb-4 text-gray-100">{fileName}</h1>
      )}
      {currentMarkdown ? (
        <div className="font-inter core-markdown pb-20 ">
          <ReactMarkdown
            remarkPlugins={[[remarkGfm, { singleTilde: false }], [remarkMath]]}
            rehypePlugins={[rehypeKatex]}
            urlTransform={transformImageUri}
            components={{
              pre: ({ children, ...props }) => (
                <pre
                  {...props}
                  style={{
                    padding: '0',
                    margin: '0',
                    backgroundColor: 'transparent',
                  }}
                >
                  {children}
                </pre>
              ),
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match) {
                  // This is a fenced code block
                  return (
                    <SyntaxHighlighter
                      style={dark} // This applies the theme (atomDark)
                      language={match[1]}
                      // PreTag="div" // Use a div as the outer element for SyntaxHighlighter
                      className={className} // Pass the original className (e.g., "language-js") to the div
                      // {...props} // Avoid spreading all props; node, inline, children are handled or not applicable
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {currentMarkdown}
          </ReactMarkdown>
        </div>
      ) : (
        // This case handles when a file is selected (fileName exists) but its content is empty or not markdown.
        // Or if preprocessedContent resulted in an empty string.
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-lg">
            {fileName
              ? `Content for ${fileName} is empty or not viewable.`
              : 'Loading content...'}
          </p>
        </div>
      )}
    </div>
  );
}

export default MarkdownRenderer;
