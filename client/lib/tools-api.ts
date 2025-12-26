import { api } from './api';
import { authApi } from './auth-api';

export type ToolStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ToolDataSourceType = 'STATIC' | 'DATABASE' | 'EXTERNAL_API';
export type AdSlotPosition = 'TOP' | 'SIDEBAR_LEFT' | 'SIDEBAR_RIGHT' | 'MIDDLE' | 'BOTTOM' | 'INLINE';
export type SyncFrequency = 'HOURLY' | 'DAILY' | 'TWICE_DAILY' | 'FOUR_TIMES_DAILY' | 'CUSTOM';
export type SyncStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface ToolCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ToolStatus;
  component: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  order: number;
  isFeatured: boolean;
  dataSourceType: ToolDataSourceType;
  dataSourceConfig?: any;
  config?: any;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  views: number;
  categoryId?: string;
  category?: ToolCategory;
  createdAt: string;
  updatedAt: string;
  adSlots?: ToolAdSlot[];
  dataSyncs?: ToolDataSync[];
}

export interface CreateToolDto {
  name: string;
  slug?: string;
  description?: string;
  status?: ToolStatus;
  component: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  order?: number;
  isFeatured?: boolean;
  dataSourceType?: ToolDataSourceType;
  dataSourceConfig?: any;
  config?: any;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  categoryId?: string;
}

export interface UpdateToolDto extends Partial<CreateToolDto> {}

export interface ToolAdSlot {
  id: string;
  toolId?: string;
  templateId?: string;
  position: AdSlotPosition;
  isActive: boolean;
  order: number;
  content?: string;
  scriptUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  tool?: Tool;
  template?: AdSlotTemplate;
}

export interface AdSlotTemplate {
  id: string;
  name: string;
  description?: string;
  position: AdSlotPosition;
  isActive: boolean;
  content?: string;
  scriptUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdSlotDto {
  toolId?: string;
  templateId?: string;
  position: AdSlotPosition;
  isActive?: boolean;
  order?: number;
  content?: string;
  scriptUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  position: AdSlotPosition;
  isActive?: boolean;
  content?: string;
  scriptUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ToolDataSync {
  id: string;
  toolId: string;
  name: string;
  description?: string;
  apiUrl: string;
  apiMethod: string;
  apiHeaders?: any;
  apiBody?: any;
  dataPath?: string;
  transformScript?: string;
  frequency: SyncFrequency;
  cronExpression?: string;
  timezone: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus: SyncStatus;
  lastError?: string;
  runCount: number;
  successCount: number;
  failCount: number;
  createdAt: string;
  updatedAt: string;
  tool?: Tool;
}

export interface CreateSyncDto {
  toolId: string;
  name: string;
  description?: string;
  apiUrl: string;
  apiMethod?: string;
  apiHeaders?: any;
  apiBody?: any;
  dataPath?: string;
  transformScript?: string;
  frequency?: SyncFrequency;
  cronExpression?: string;
  timezone?: string;
  isActive?: boolean;
}

export const toolsApi = {
  // Tool Categories
  getCategories: async (includeInactive = false): Promise<ToolCategory[]> => {
    const query = includeInactive ? '?includeInactive=true' : '';
    return api.get<ToolCategory[]>(`/tool-categories${query}`);
  },

  getCategoryBySlug: async (slug: string): Promise<ToolCategory> => {
    return api.get<ToolCategory>(`/tool-categories/slug/${slug}`);
  },

  // Tools
  getAll: async (status?: string, categoryId?: string, includeInactive = false): Promise<Tool[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (categoryId) params.append('categoryId', categoryId);
    if (includeInactive) params.append('includeInactive', 'true');
    const query = params.toString();
    return api.get<Tool[]>(`/tools${query ? `?${query}` : ''}`);
  },

  getBySlug: async (slug: string): Promise<Tool> => {
    return api.get<Tool>(`/tools/slug/${slug}`);
  },

  getFeatured: async (limit?: number): Promise<Tool[]> => {
    const query = limit ? `?limit=${limit}` : '';
    return api.get<Tool[]>(`/tools/featured${query}`);
  },

  getOne: async (id: string): Promise<Tool> => {
    return api.get<Tool>(`/tools/${id}`);
  },

  getToolData: async (id: string): Promise<{ data: any }> => {
    return api.get<{ data: any }>(`/tools/${id}/data`);
  },

  create: async (data: CreateToolDto): Promise<Tool> => {
    return authApi.post<Tool>('/tools', data);
  },

  update: async (id: string, data: UpdateToolDto): Promise<Tool> => {
    return authApi.patch<Tool>(`/tools/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return authApi.delete(`/tools/${id}`);
  },

  // Ad Slots
  getAdSlots: async (toolId?: string): Promise<ToolAdSlot[]> => {
    const query = toolId ? `?toolId=${toolId}` : '';
    return api.get<ToolAdSlot[]>(`/tool-ad-slots${query}`);
  },

  getActiveAdSlots: async (toolId?: string): Promise<ToolAdSlot[]> => {
    const query = toolId ? `?toolId=${toolId}` : '';
    return api.get<ToolAdSlot[]>(`/tool-ad-slots/active${query}`);
  },

  createAdSlot: async (data: CreateAdSlotDto): Promise<ToolAdSlot> => {
    return authApi.post<ToolAdSlot>('/tool-ad-slots', data);
  },

  updateAdSlot: async (id: string, data: Partial<CreateAdSlotDto>): Promise<ToolAdSlot> => {
    return authApi.patch<ToolAdSlot>(`/tool-ad-slots/${id}`, data);
  },

  deleteAdSlot: async (id: string): Promise<void> => {
    return authApi.delete(`/tool-ad-slots/${id}`);
  },

  bulkCreateAdSlots: async (toolIds: string[], templateId: string): Promise<ToolAdSlot[]> => {
    return authApi.post<ToolAdSlot[]>('/tool-ad-slots/bulk', { toolIds, templateId });
  },

  // Ad Slot Templates
  getTemplates: async (): Promise<AdSlotTemplate[]> => {
    return authApi.get<AdSlotTemplate[]>('/ad-slot-templates');
  },

  getTemplate: async (id: string): Promise<AdSlotTemplate> => {
    return authApi.get<AdSlotTemplate>(`/ad-slot-templates/${id}`);
  },

  createTemplate: async (data: CreateTemplateDto): Promise<AdSlotTemplate> => {
    return authApi.post<AdSlotTemplate>('/ad-slot-templates', data);
  },

  updateTemplate: async (id: string, data: Partial<CreateTemplateDto>): Promise<AdSlotTemplate> => {
    return authApi.patch<AdSlotTemplate>(`/ad-slot-templates/${id}`, data);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return authApi.delete(`/ad-slot-templates/${id}`);
  },

  applyTemplateToTools: async (templateId: string, toolIds: string[]): Promise<any> => {
    return authApi.post(`/ad-slot-templates/${templateId}/apply-to-tools`, { toolIds });
  },

  removeTemplateFromTools: async (templateId: string, toolIds: string[]): Promise<any> => {
    return authApi.post(`/ad-slot-templates/${templateId}/remove-from-tools`, { toolIds });
  },

  // Data Sync
  getDataSyncs: async (toolId?: string): Promise<ToolDataSync[]> => {
    const query = toolId ? `?toolId=${toolId}` : '';
    return authApi.get<ToolDataSync[]>(`/tool-data-syncs${query}`);
  },

  getDataSync: async (id: string): Promise<ToolDataSync> => {
    return authApi.get<ToolDataSync>(`/tool-data-syncs/${id}`);
  },

  getSyncHistory: async (id: string, limit = 50): Promise<any[]> => {
    return authApi.get<any[]>(`/tool-data-syncs/${id}/history?limit=${limit}`);
  },

  createDataSync: async (data: CreateSyncDto): Promise<ToolDataSync> => {
    return authApi.post<ToolDataSync>('/tool-data-syncs', data);
  },

  updateDataSync: async (id: string, data: Partial<CreateSyncDto>): Promise<ToolDataSync> => {
    return authApi.patch<ToolDataSync>(`/tool-data-syncs/${id}`, data);
  },

  deleteDataSync: async (id: string): Promise<void> => {
    return authApi.delete(`/tool-data-syncs/${id}`);
  },

  runDataSync: async (id: string): Promise<any> => {
    return authApi.post(`/tool-data-syncs/${id}/run`, {});
  },
};

