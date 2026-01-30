export interface QueryParams {
    filter?: any;
    sort?: any;
    limit?: number;
    page?: number;
    select?: string;
}

export const buildQueryString = (params: QueryParams): string => {
    const query = new URLSearchParams();
    if (params.filter) {
        query.append('filter', typeof params.filter === 'object' ? JSON.stringify(params.filter) : params.filter);
    }
    if (params.sort) {
        query.append('sort', typeof params.sort === 'object' ? JSON.stringify(params.sort) : params.sort);
    }
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.page) query.append('page', params.page.toString());
    if (params.select) query.append('select', params.select);
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
};
