import React, { useEffect, useState } from 'react';

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 10; // number of deals per page

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/deals?page=${currentPage}&limit=${pageSize}`);
        const data = await response.json();
        setDeals(data.deals);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div>
      <h1>Deals</h1>
      {loading ? <p>Loading deals...</p> : (
        <ul>
          {deals.map(deal => (
            <li key={deal.id}>{deal.name}</li>
          ))}
        </ul>
      )}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={{ fontWeight: currentPage === page ? 'bold' : 'normal' }}
          >
            {page}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default DealsPage;
