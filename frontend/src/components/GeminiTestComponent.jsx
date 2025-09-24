import React, { useState } from 'react';
import geminiService from '../services/geminiService';

const GeminiTestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testTemplate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const mockContact = {
        first_name: 'John',
        last_name: 'Doe',
        company_name: 'Test Company',
        email: 'john@example.com'
      };

      console.log('Testing template generation...');
      const generated = await geminiService.generateEmailContent(mockContact, '', '');
      setResult(generated);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testEnhancement = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const mockContact = {
        first_name: 'Jane',
        last_name: 'Smith',
        company_name: 'Example Corp',
        email: 'jane@example.com'
      };

      console.log('Testing enhancement...');
      const generated = await geminiService.generateEmailContent(
        mockContact, 
        'Quick follow up',
        'Hi, wanted to follow up on our conversation.'
      );
      setResult(generated);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Gemini API Test Component</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testTemplate} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Template Generation'}
        </button>
        
        <button onClick={testEnhancement} disabled={isLoading} style={{ marginLeft: '10px' }}>
          {isLoading ? 'Testing...' : 'Test Enhancement'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '10px' }}>
          <h4>Generated Content:</h4>
          <div style={{ backgroundColor: '#f5f5f5', padding: '10px', marginTop: '5px' }}>
            <p><strong>Subject:</strong> {result.subject}</p>
            <p><strong>Body:</strong></p>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{result.body}</pre>
          </div>
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Open browser console to see detailed logs.
      </div>
    </div>
  );
};

export default GeminiTestComponent;
