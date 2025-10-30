import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import Icon from '../../../components/AppIcon';

const WordPreview = ({ fileUrl, fileName }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWordFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }

        const arrayBuffer = await response.arrayBuffer();

        // Convert Word document to HTML
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Title'] => h1.title:fresh",
              "r[style-name='Strong'] => strong",
              "r[style-name='Emphasis'] => em"
            ]
          }
        );

        if (result.messages && result.messages.length > 0) {
          console.warn('Mammoth conversion warnings:', result.messages);
        }

        setHtmlContent(result.value || '<p>Document is empty</p>');
        setLoading(false);
      } catch (err) {
        console.error('Word preview error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadWordFile();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-text-secondary">Loading Word document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <Icon name="AlertCircle" size={48} className="text-error mb-4" />
        <h4 className="text-lg font-semibold text-text-primary mb-2">Failed to load Word document</h4>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-h-[600px] overflow-auto">
        <style>{`
          .word-preview-content {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
          }
          .word-preview-content h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: var(--text-primary);
          }
          .word-preview-content h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.83em 0 0.5em 0;
            color: var(--text-primary);
          }
          .word-preview-content h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: var(--text-primary);
          }
          .word-preview-content p {
            margin: 0.5em 0;
          }
          .word-preview-content ul, .word-preview-content ol {
            margin: 0.5em 0;
            padding-left: 2em;
          }
          .word-preview-content li {
            margin: 0.25em 0;
          }
          .word-preview-content table {
            border-collapse: collapse;
            margin: 1em 0;
            width: 100%;
          }
          .word-preview-content table td, .word-preview-content table th {
            border: 1px solid var(--border);
            padding: 0.5em;
          }
          .word-preview-content table th {
            background-color: var(--background);
            font-weight: bold;
          }
          .word-preview-content strong {
            font-weight: bold;
          }
          .word-preview-content em {
            font-style: italic;
          }
          .word-preview-content a {
            color: var(--primary);
            text-decoration: underline;
          }
          .word-preview-content img {
            max-width: 100%;
            height: auto;
            margin: 1em 0;
          }
        `}</style>
        <div
          className="word-preview-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default WordPreview;
