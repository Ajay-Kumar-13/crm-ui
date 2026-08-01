import { useEffect, useMemo, useState } from 'react';

export const usePagination = (items, initialPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const pageCount = Math.max(Math.ceil(items.length / pageSize), 1);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const paginated = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    setPage,
    pageSize,
    setPageSize: (size) => {
      setPageSize(size);
      setPage(1);
    },
    pageCount,
    paginated,
    totalItems: items.length,
  };
};
