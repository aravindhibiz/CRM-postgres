// Export service for Pipeline Analytics
import { format } from 'date-fns';

class ExportService {
  constructor() {
    this.exportInProgress = false;
  }

  // Generate CSV content from data
  generateCSV(data, headers, filename) {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(' ', '_')] || row[header] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(','))
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  // Generate comprehensive analytics report as CSV
  async exportAnalyticsCSV(analyticsData, filters) {
    try {
      this.exportInProgress = true;
      
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `pipeline_analytics_${timestamp}.csv`;

      // Prepare data sections
      const sections = [];

      // 1. Export Summary
      sections.push('PIPELINE ANALYTICS REPORT');
      sections.push(`Generated: ${format(new Date(), 'PPpp')}`);
      sections.push(`Date Range: ${filters.dateRange || 'All Time'}`);
      sections.push(`Sales Rep: ${filters.repName || 'All Representatives'}`);
      sections.push('');

      // 2. Key Metrics
      if (analyticsData.velocityMetrics && analyticsData.velocityMetrics.length > 0) {
        sections.push('KEY METRICS');
        sections.push('Metric,Value,Change,Trend');
        analyticsData.velocityMetrics.forEach(metric => {
          sections.push(`${metric.metric},${metric.value},${metric.change || 'N/A'},${metric.trend || 'N/A'}`);
        });
        sections.push('');
      }

      // 3. Revenue Trend Data
      if (analyticsData.revenueTrendData && analyticsData.revenueTrendData.length > 0) {
        sections.push('REVENUE TRENDS (Monthly)');
        sections.push('Month,Actual Revenue,Forecast,Target');
        analyticsData.revenueTrendData.forEach(item => {
          sections.push(`${item.month},$${item.actual},$${item.forecast},$${item.target}`);
        });
        sections.push('');
      }

      // 4. Pipeline Funnel Data
      if (analyticsData.pipelineFunnelData && analyticsData.pipelineFunnelData.length > 0) {
        sections.push('PIPELINE FUNNEL');
        sections.push('Stage,Value,Deal Count');
        analyticsData.pipelineFunnelData.forEach(stage => {
          sections.push(`${stage.name},$${stage.value},${stage.count}`);
        });
        sections.push('');
      }

      // 5. Win Rate Data
      if (analyticsData.winRateData && analyticsData.winRateData.length > 0) {
        sections.push('WIN RATE BY QUARTER');
        sections.push('Period,Win Rate %');
        analyticsData.winRateData.forEach(item => {
          sections.push(`${item.period},${item.winRate}%`);
        });
        sections.push('');
      }

      const csvContent = sections.join('\n');
      this.downloadFile(csvContent, filename, 'text/csv');
      
      return { success: true, filename };
    } catch (error) {
      console.error('CSV Export failed:', error);
      throw new Error('Failed to export CSV: ' + error.message);
    } finally {
      this.exportInProgress = false;
    }
  }

  // Generate JSON export for detailed data analysis
  async exportAnalyticsJSON(analyticsData, filters) {
    try {
      this.exportInProgress = true;
      
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `pipeline_analytics_${timestamp}.json`;

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          dateRange: filters.dateRange || 'all',
          salesRep: filters.repName || 'all',
          appliedFilters: filters
        },
        analytics: {
          keyMetrics: analyticsData.velocityMetrics || [],
          revenueTrends: analyticsData.revenueTrendData || [],
          pipelineFunnel: analyticsData.pipelineFunnelData || [],
          winRates: analyticsData.winRateData || [],
          forecastData: analyticsData.forecastData || [],
          performanceData: analyticsData.repPerformanceData || []
        },
        summary: {
          totalRevenue: analyticsData.revenueTrendData ? 
            analyticsData.revenueTrendData.reduce((sum, item) => sum + item.actual, 0) : 0,
          totalDeals: analyticsData.pipelineFunnelData ? 
            analyticsData.pipelineFunnelData.reduce((sum, stage) => sum + stage.count, 0) : 0,
          avgWinRate: analyticsData.winRateData && analyticsData.winRateData.length > 0 ? 
            analyticsData.winRateData.reduce((sum, item) => sum + item.winRate, 0) / analyticsData.winRateData.length : 0
        }
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      this.downloadFile(jsonContent, filename, 'application/json');
      
      return { success: true, filename };
    } catch (error) {
      console.error('JSON Export failed:', error);
      throw new Error('Failed to export JSON: ' + error.message);
    } finally {
      this.exportInProgress = false;
    }
  }

  // Generate PDF report using HTML to Canvas approach
  async exportAnalyticsPDF(analyticsData, filters, chartRefs = {}) {
    try {
      this.exportInProgress = true;
      
      // Dynamic import to avoid bundle size issues
      const html2canvas = await import('html2canvas').then(module => module.default);
      const jsPDF = await import('jspdf').then(module => module.jsPDF);

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `pipeline_analytics_${timestamp}.pdf`;

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Add title and metadata
      pdf.setFontSize(20);
      pdf.text('Pipeline Analytics Report', 20, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, currentY);
      currentY += 7;
      pdf.text(`Date Range: ${filters.dateRange || 'All Time'}`, 20, currentY);
      currentY += 7;
      pdf.text(`Sales Rep: ${filters.repName || 'All Representatives'}`, 20, currentY);
      currentY += 15;

      // Add key metrics table
      if (analyticsData.velocityMetrics && analyticsData.velocityMetrics.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Key Performance Metrics', 20, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        const tableData = analyticsData.velocityMetrics.map(metric => [
          metric.metric,
          metric.value,
          metric.change || 'N/A',
          metric.trend || 'N/A'
        ]);

        // Simple table layout
        const headers = ['Metric', 'Value', 'Change', 'Trend'];
        let tableY = currentY;
        
        // Headers
        headers.forEach((header, index) => {
          pdf.text(header, 20 + (index * 40), tableY);
        });
        tableY += 7;

        // Data rows
        tableData.forEach(row => {
          row.forEach((cell, index) => {
            pdf.text(String(cell), 20 + (index * 40), tableY);
          });
          tableY += 6;
        });
        
        currentY = tableY + 10;
      }

      // Add charts if available
      if (chartRefs.revenueChart && chartRefs.revenueChart.current) {
        try {
          const canvas = await html2canvas(chartRefs.revenueChart.current, {
            backgroundColor: 'white',
            scale: 2
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page
          if (currentY + imgHeight > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFontSize(14);
          pdf.text('Revenue Trends', 20, currentY);
          currentY += 10;
          
          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
        } catch (chartError) {
          console.warn('Could not capture revenue chart:', chartError);
        }
      }

      // Add summary data
      if (analyticsData.revenueTrendData && analyticsData.revenueTrendData.length > 0) {
        // Check if we need a new page
        if (currentY + 50 > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Revenue Summary', 20, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        const totalRevenue = analyticsData.revenueTrendData.reduce((sum, item) => sum + item.actual, 0);
        const avgMonthly = totalRevenue / analyticsData.revenueTrendData.length;
        
        pdf.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 20, currentY);
        currentY += 7;
        pdf.text(`Average Monthly: $${avgMonthly.toLocaleString()}`, 20, currentY);
        currentY += 7;
        pdf.text(`Reporting Period: ${analyticsData.revenueTrendData.length} months`, 20, currentY);
      }

      // Save the PDF
      pdf.save(filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('PDF Export failed:', error);
      throw new Error('Failed to export PDF: ' + error.message);
    } finally {
      this.exportInProgress = false;
    }
  }

  // Enhanced Excel export with multiple sheets
  async exportAnalyticsExcel(analyticsData, filters) {
    try {
      this.exportInProgress = true;
      
      // Dynamic import to avoid bundle size issues
      const XLSX = await import('xlsx');

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `pipeline_analytics_${timestamp}.xlsx`;

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ['Pipeline Analytics Report'],
        ['Generated', format(new Date(), 'PPpp')],
        ['Date Range', filters.dateRange || 'All Time'],
        ['Sales Rep', filters.repName || 'All Representatives'],
        [''],
        ['Summary Metrics'],
      ];

      if (analyticsData.velocityMetrics && analyticsData.velocityMetrics.length > 0) {
        summaryData.push(['Metric', 'Value', 'Change', 'Trend']);
        analyticsData.velocityMetrics.forEach(metric => {
          summaryData.push([metric.metric, metric.value, metric.change || 'N/A', metric.trend || 'N/A']);
        });
      }

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Sheet 2: Revenue Trends
      if (analyticsData.revenueTrendData && analyticsData.revenueTrendData.length > 0) {
        const revenueData = [
          ['Month', 'Actual Revenue', 'Forecast', 'Target'],
          ...analyticsData.revenueTrendData.map(item => [
            item.month,
            item.actual,
            item.forecast,
            item.target
          ])
        ];
        const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Trends');
      }

      // Sheet 3: Pipeline Funnel
      if (analyticsData.pipelineFunnelData && analyticsData.pipelineFunnelData.length > 0) {
        const pipelineData = [
          ['Stage', 'Value', 'Deal Count', 'Conversion Rate'],
          ...analyticsData.pipelineFunnelData.map((stage, index, array) => [
            stage.name,
            stage.value,
            stage.count,
            index < array.length - 1 ? 
              `${((stage.count / array[0].count) * 100).toFixed(1)}%` : 
              'Final Stage'
          ])
        ];
        const pipelineSheet = XLSX.utils.aoa_to_sheet(pipelineData);
        XLSX.utils.book_append_sheet(workbook, pipelineSheet, 'Pipeline Funnel');
      }

      // Sheet 4: Win Rates
      if (analyticsData.winRateData && analyticsData.winRateData.length > 0) {
        const winRateData = [
          ['Period', 'Win Rate %'],
          ...analyticsData.winRateData.map(item => [item.period, item.winRate])
        ];
        const winRateSheet = XLSX.utils.aoa_to_sheet(winRateData);
        XLSX.utils.book_append_sheet(workbook, winRateSheet, 'Win Rates');
      }

      // Apply formatting to sheets
      Object.keys(workbook.Sheets).forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        
        // Auto-size columns
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const colWidths = [];
        
        for (let C = range.s.c; C <= range.e.c; C++) {
          let maxWidth = 10;
          for (let R = range.s.r; R <= range.e.r; R++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = sheet[cellAddress];
            if (cell && cell.v) {
              const cellLength = String(cell.v).length;
              if (cellLength > maxWidth) {
                maxWidth = cellLength;
              }
            }
          }
          colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
        }
        
        sheet['!cols'] = colWidths;
      });

      // Write file
      XLSX.writeFile(workbook, filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Excel Export failed:', error);
      throw new Error('Failed to export Excel: ' + error.message);
    } finally {
      this.exportInProgress = false;
    }
  }

  // Schedule email report (placeholder for backend integration)
  async scheduleEmailReport(analyticsData, filters, emailSettings) {
    try {
      this.exportInProgress = true;
      
      // This would integrate with your backend email service
      const reportData = {
        type: 'scheduled_report',
        data: analyticsData,
        filters,
        emailSettings,
        scheduledFor: emailSettings.schedule || 'weekly'
      };

      // Placeholder API call
      
      // For now, we'll create a JSON file that could be sent to backend
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `email_report_config_${timestamp}.json`;
      
      const configContent = JSON.stringify({
        message: 'Email reporting would be configured with these settings',
        ...reportData
      }, null, 2);
      
      this.downloadFile(configContent, filename, 'application/json');
      
      return { 
        success: true, 
        message: 'Email report configuration saved. Contact your administrator to set up email delivery.',
        filename 
      };
    } catch (error) {
      console.error('Email scheduling failed:', error);
      throw new Error('Failed to schedule email report: ' + error.message);
    } finally {
      this.exportInProgress = false;
    }
  }

  // Utility function to download files
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Check if export is in progress
  isExporting() {
    return this.exportInProgress;
  }
}

export default new ExportService();