import { api } from './api';

export enum IpoStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  DRAFT = 'DRAFT',
}

export interface IpoListing {
  id: string;
  bistCode: string;
  companyName: string;
  ipoDate: string;
  logoUrl?: string;
  isNew: boolean;
  hasResults: boolean;
  status: IpoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IpoDetail {
  id: string;
  listingId: string;
  ipoDate?: string;
  ipoDateTimeRange?: string;
  ipoPrice?: string;
  distributionMethod?: string;
  shareAmount?: string;
  intermediary?: string;
  consortium: string[];
  actualCirculation?: string;
  actualCirculationPct?: string;
  firstTradeDate?: string;
  market?: string;
  summaryInfo?: any;
  companyDescription?: string;
  city?: string;
  foundedDate?: string;
  attachments?: any;
  lastModified?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IpoResult {
  id: string;
  listingId: string;
  resultsData: any;
  createdAt: string;
  updatedAt: string;
}

export interface IpoApplicationPlace {
  id: string;
  listingId: string;
  name: string;
  isConsortium: boolean;
  isUnlisted: boolean;
  createdAt: string;
}

export interface IpoResponse {
  listing: IpoListing;
  detail?: IpoDetail;
  results?: IpoResult;
  applicationPlaces?: IpoApplicationPlace[];
}

export interface IpoListResponse {
  data: IpoResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetIpoListParams {
  status?: IpoStatus | IpoStatus[];
  isNew?: boolean;
  hasResults?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const ipoApi = {
  /**
   * Get paginated IPO list with optional filters
   */
  getIpoList: async (params: GetIpoListParams = {}): Promise<IpoListResponse> => {
    // Construct query string manually to handle params
    const searchParams = new URLSearchParams();
    if (params.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach(s => searchParams.append('status', s)); 
      } else {
        searchParams.append('status', params.status);
      }
    }
    if (params.isNew !== undefined) searchParams.append('isNew', String(params.isNew));
    if (params.hasResults !== undefined) searchParams.append('hasResults', String(params.hasResults));
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));

    const queryString = searchParams.toString();
    const endpoint = `/ipo${queryString ? `?${queryString}` : ''}`;
    
    return api.get<IpoListResponse>(endpoint);
  },

  /**
   * Get single IPO details by BIST code
   */
  getIpoDetail: async (bistCode: string): Promise<IpoResponse> => {
    return api.get<IpoResponse>(`/ipo/${bistCode}`);
  },
};
