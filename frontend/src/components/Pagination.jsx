import React from 'react';
import Icon from './AppIcon';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Calculate start and end of visible page range
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // Always show first page
    if (start > 1) {
      range.push(1);
      if (start > 2) {
        range.push('...');
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }

    return range;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Items info */}
      {showInfo && (
        <div className="text-sm text-text-secondary">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          title="Previous page"
        >
          <Icon name="ChevronLeft" size={16} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-3 py-2 text-text-tertiary">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    pageNum === currentPage
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          title="Next page"
        >
          <Icon name="ChevronRight" size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;