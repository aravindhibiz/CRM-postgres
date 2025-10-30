import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Icon from '../../../components/AppIcon';

const ExcelPreview = ({ fileUrl, fileName }) => {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    const loadExcelFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbookData = XLSX.read(data, { type: 'array' });

        if (workbookData.SheetNames.length === 0) {
          setError('Excel file has no sheets');
          setLoading(false);
          return;
        }

        setWorkbook(workbookData);
        setSheetNames(workbookData.SheetNames);
        setActiveSheet(workbookData.SheetNames[0]);
        loadSheetData(workbookData, workbookData.SheetNames[0]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadExcelFile();
    }
  }, [fileUrl]);

  const loadSheetData = (wb, sheetName) => {
    try {
      const worksheet = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (jsonData.length === 0) {
        setHeaders([]);
        setSheetData([]);
        return;
      }

      // First row as headers
      const headerRow = jsonData[0];
      const dataRows = jsonData.slice(1);

      setHeaders(headerRow);
      setSheetData(dataRows);
      setCurrentPage(1); // Reset to first page when switching sheets
    } catch (err) {
      console.error('Error loading sheet:', err);
      setHeaders([]);
      setSheetData([]);
    }
  };

  const handleSheetChange = (sheetName) => {
    setActiveSheet(sheetName);
    loadSheetData(workbook, sheetName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-text-secondary">Loading Excel file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <Icon name="AlertCircle" size={48} className="text-error mb-4" />
        <h4 className="text-lg font-semibold text-text-primary mb-2">Failed to load Excel file</h4>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(sheetData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = sheetData.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col">
      {/* Sheet Tabs */}
      {sheetNames.length > 1 && (
        <div className="flex items-center space-x-1 px-2 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-x-auto">
          {sheetNames.map((sheetName) => (
            <button
              key={sheetName}
              onClick={() => handleSheetChange(sheetName)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                activeSheet === sheetName
                  ? 'bg-white dark:bg-gray-700 text-primary shadow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {sheetName}
            </button>
          ))}
        </div>
      )}

      {/* Info Bar */}
      <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <span><strong>{sheetData.length}</strong> rows</span>
          <span>•</span>
          <span><strong>{headers.length}</strong> columns</span>
          {sheetNames.length > 1 && (
            <>
              <span>•</span>
              <span><strong>{sheetNames.length}</strong> sheets</span>
            </>
          )}
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
        {headers.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-text-secondary">Sheet is empty</p>
          </div>
        ) : (
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
                    {header || `Column ${index + 1}`}
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
                  {headers.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 text-sm text-text-primary border-b border-border whitespace-nowrap"
                    >
                      {row[colIndex] !== undefined && row[colIndex] !== null ? String(row[colIndex]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;
