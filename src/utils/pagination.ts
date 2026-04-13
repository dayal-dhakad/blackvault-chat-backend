export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export const getPagination = ({ page = 1, limit = 20 }: PaginationQuery) => {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(100, Math.max(1, limit));

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
};
