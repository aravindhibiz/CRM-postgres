import React from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';

// Let's test the imports that were failing one by one
const PipelineAnalyticsImportTest = () => {
  const [importTests, setImportTests] = React.useState({
    recharts: 'Testing...',
    exportMenu: 'Testing...',
    dealsService: 'Testing...',
    configService: 'Testing...',
    lucideReact: 'Testing...'
  });

  React.useEffect(() => {
    const testImports = async () => {
      const results = { ...importTests };

      // Test Recharts
      try {
        const recharts = await import('recharts');
        results.recharts = '✅ Recharts imported successfully';
      } catch (error) {
        results.recharts = `❌ Recharts failed: ${error.message}`;
      }

      // Test ExportMenu
      try {
        const ExportMenu = await import('../../components/ExportMenu');
        results.exportMenu = '✅ ExportMenu imported successfully';
      } catch (error) {
        results.exportMenu = `❌ ExportMenu failed: ${error.message}`;
      }

      // Test dealsService
      try {
        const dealsService = await import('../../services/dealsService');
        results.dealsService = '✅ dealsService imported successfully';
      } catch (error) {
        results.dealsService = `❌ dealsService failed: ${error.message}`;
      }

      // Test configService
      try {
        const configService = await import('../../services/configService');
        results.configService = '✅ configService imported successfully';
      } catch (error) {
        results.configService = `❌ configService failed: ${error.message}`;
      }

      // Test lucide-react
      try {
        const lucideReact = await import('lucide-react');
        results.lucideReact = '✅ lucide-react imported successfully';
      } catch (error) {
        results.lucideReact = `❌ lucide-react failed: ${error.message}`;
      }

      setImportTests(results);
    };

    testImports();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/sales-dashboard' },
          { label: 'Pipeline Analytics', href: '/pipeline-analytics' }
        ]} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics - Dynamic Import Testing</h1>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Import Status:</h2>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              {Object.entries(importTests).map(([key, status]) => (
                <div key={key} className="font-mono text-sm">
                  <strong>{key}:</strong> {status}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Analysis:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>This test uses dynamic imports to avoid build-time failures.</p>
              <p>If any import fails here, we know the exact cause of the original error.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsImportTest;