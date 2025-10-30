import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Icon from '../../../components/AppIcon';

const CsvPreview = ({ fileUrl, fileName }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    const loadCsvFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }

        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }

            if (results.data.length === 0) {
              setError('CSV file is empty');
              setLoading(false);
              return;
            }

            setHeaders(results.meta.fields || Object.keys(results.data[0]));
            setData(results.data);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadCsvFile();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-text-secondary">Loading CSV file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <Icon name="AlertCircle" size={48} className="text-error mb-4" />
        <h4 className="text-lg font-semibold text-text-primary mb-2">Failed to load CSV</h4>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col">
      {/* Info Bar */}
      <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <span><strong>{data.length}</strong> rows</span>
          <span>•</span>
          <span><strong>{headers.length}</strong> columns</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-b-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary border-b border-border w-12">
                #
              </th>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-xs font-semibold text-text-secondary border-b border-border whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr
                key={startIndex + rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-2 text-xs text-text-tertiary border-b border-border">
                  {startIndex + rowIndex + 1}
                </td>
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 text-sm text-text-primary border-b border-border whitespace-nowrap"
                  >
                    {row[header] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CsvPreview;
