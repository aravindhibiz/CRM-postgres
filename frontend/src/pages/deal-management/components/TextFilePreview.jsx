import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const TextFilePreview = ({ fileUrl, fileName }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTextFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadTextFile();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-text-secondary">Loading text file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <Icon name="AlertCircle" size={48} className="text-error mb-4" />
        <h4 className="text-lg font-semibold text-text-primary mb-2">Failed to load file</h4>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-h-[600px] overflow-auto">
        <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap break-words">
          {content || 'File is empty'}
        </pre>
      </div>
    </div>
  );
};

export default TextFilePreview;
