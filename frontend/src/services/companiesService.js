import apiClient from '../lib/apiClient';

export const companiesService = {
  // Get all companies (public read access)
  async getAllCompanies() {
    try {
      const { data, error } = await apiClient.get('/api/v1/companies');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('DEBUG: getAllCompanies error:', error);
      throw error;
    }
  },

  // Get a specific company by ID
  async getCompanyById(companyId) {
    const { data, error } = await apiClient.get(`/api/v1/companies/${companyId}`);

    if (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Create a new company
  async createCompany(companyData) {
    const cleanCompanyData = {
      name: companyData.name,
      industry: companyData.industry || null,
      size: companyData.size || null,
      website: companyData.website || null,
      phone: companyData.phone || null,
      email: companyData.email || null,
      address: companyData.address || null,
      city: companyData.city || null,
      state: companyData.state || null,
      zip_code: companyData.zip_code || null,
      country: companyData.country || null,
      description: companyData.description || null,
      revenue: companyData.revenue || null,
      custom_fields: companyData.custom_fields || undefined,
    };

    const { data, error } = await apiClient.post('/api/v1/companies', cleanCompanyData);

    if (error) throw error;
    return data;
  },

  // Update a company
  async updateCompany(companyId, updates) {
    // Ensure we pass all the fields properly, similar to create
    const cleanUpdateData = {
      name: updates.name,
      industry: updates.industry || null,
      size: updates.size || null,
      website: updates.website || null,
      phone: updates.phone || null,
      email: updates.email || null,
      address: updates.address || null,
      city: updates.city || null,
      state: updates.state || null,
      zip_code: updates.zip_code || null,
      country: updates.country || null,
      description: updates.description || null,
      revenue: updates.revenue || null,
      custom_fields: updates.custom_fields || undefined,
    };

    const { data, error } = await apiClient.put(`/api/v1/companies/${companyId}`, cleanUpdateData);

    if (error) throw error;
    return data;
  },

  // Delete a company
  async deleteCompany(companyId) {
    const { data, error } = await apiClient.delete(`/api/v1/companies/${companyId}`);

    if (error) throw error;
    return true;
  },

  // Search companies
  async searchCompanies(searchQuery) {
    const { data, error } = await apiClient.get(`/api/v1/companies/search?q=${encodeURIComponent(searchQuery)}`);

    if (error) throw error;
    return data || [];
  },

  // Filter companies by industry
  async getCompaniesByIndustry(industry) {
    const { data, error } = await apiClient.get(`/api/v1/companies?industry=${encodeURIComponent(industry)}`);

    if (error) throw error;
    return data || [];
  },

  // Get company statistics
  async getCompanyStats() {
    try {
      const { data, error } = await apiClient.get('/api/v1/companies/statistics');

      if (error) {
        // Fallback: calculate stats from all companies
        const companies = await this.getAllCompanies();

        const stats = {
          total: companies.length || 0,
          industries: {},
          sizes: {},
          recentlyAdded: companies.filter(company => {
            const createdAt = new Date(company.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt > thirtyDaysAgo;
          }).length
        };

        // Count by industry
        companies.forEach(company => {
          const industry = company.industry || 'unknown';
          stats.industries[industry] = (stats.industries[industry] || 0) + 1;
        });

        // Count by size
        companies.forEach(company => {
          const size = company.size || 'unknown';
          stats.sizes[size] = (stats.sizes[size] || 0) + 1;
        });

        return stats;
      }

      return data;
    } catch (error) {
      console.error('DEBUG: getCompanyStats error:', error);
      throw error;
    }
  },

  // Get companies with enriched data
  async getCompaniesWithData() {
    const { data, error } = await apiClient.get('/api/v1/companies?include=contacts,deals');

    if (error) throw error;
    return data || [];
  },

  // Filter companies with advanced filters
  async filterCompanies(filters) {
    const params = new URLSearchParams();

    if (filters.industry && filters.industry.length > 0) {
      params.append('industry', filters.industry.join(','));
    }

    if (filters.size && filters.size.length > 0) {
      params.append('size', filters.size.join(','));
    }

    if (filters.location && filters.location.length > 0) {
      params.append('location', filters.location.join(','));
    }

    if (filters.revenueRange) {
      if (filters.revenueRange.min !== undefined) {
        params.append('min_revenue', filters.revenueRange.min);
      }
      if (filters.revenueRange.max !== undefined) {
        params.append('max_revenue', filters.revenueRange.max);
      }
    }

    if (filters.dateRange) {
      params.append('date_start', filters.dateRange.start);
      params.append('date_end', filters.dateRange.end);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/companies?${queryString}` : '/api/v1/companies';

    const { data, error } = await apiClient.get(endpoint);

    if (error) throw error;
    return data || [];
  },

  // Get company with all related data (contacts, deals, activities)
  async getCompanyWithRelations(companyId) {
    const { data, error } = await apiClient.get(`/api/v1/companies/${companyId}?include=contacts,deals,activities`);

    if (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Import companies (bulk create)
  async importCompanies(companiesData) {
    try {
      const results = await Promise.all(
        companiesData.map(companyData => this.createCompany(companyData))
      );
      return results;
    } catch (error) {
      throw error;
    }
  },

  // Subscribe to company changes (placeholder for real-time updates)
  subscribeToCompanies(callback) {
    // Since we don't have real-time updates, return a stub
    return {
      unsubscribe: () => {
        // Cleanup if needed
      }
    };
  }
};

export default companiesService;