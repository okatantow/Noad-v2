// hooks/useCSVExport.js
import { useCallback } from 'react';

const useCSVExport = () => {
  const getDynamicHeaders = useCallback((posts) => {
    const allFieldNames = new Set();
    
    // Collect all unique field names from post_values
    posts.forEach(post => {
      post.post_values?.forEach(({ field_name }) => {
        if (field_name) allFieldNames.add(field_name);
      });
    });

    return Array.from(allFieldNames);
  }, []);

  const generateCSVContent = useCallback((posts) => {
    if (!posts?.length) return null;

    // Standard columns
    const baseHeaders = [
      'ID', 'Title', 'Description', 'Latitude', 'Longitude', 
      'Created At', 'Status', 'Is Entity', 'Category', 'Tags'
    ];

    // Dynamic columns from post_values
    const dynamicHeaders = getDynamicHeaders(posts);
    const headers = [...baseHeaders, ...dynamicHeaders].join(',');

    const rows = posts.map(post => {
      const escape = (str) => `"${String(str).replace(/"/g, '""')}"`;
      
      // Base fields
      const baseFields = [
        post.id,
        post.title,
        post.description,
        post.latitude,
        post.longitude,
        new Date(post.created_at).toLocaleDateString(),
        post.status,
        post.is_entity,
        post.category_name,
        post.tags
      ];

      // Create map of dynamic values
      const valueMap = new Map();
      post.post_values?.forEach(({ field_name, field_value }) => {
        if (field_name) valueMap.set(field_name, field_value);
      });

      // Add dynamic values in header order
      const dynamicValues = dynamicHeaders.map(header => 
        valueMap.get(header) || ''
      );

      return [...baseFields, ...dynamicValues]
        .map(field => escape(field))
        .join(',');
    });

    return [headers, ...rows].join('\n');
  }, [getDynamicHeaders]);

  const downloadCSV = useCallback((content, fileName = 'posts.csv') => {
    if (!content) return;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  const exportPostsToCSV = useCallback((posts, fileName) => {
    try {
      if (!posts?.length) throw new Error('No posts to export');
      
      const content = generateCSVContent(posts);
      if (!content) throw new Error('Failed to generate CSV content');
      
      downloadCSV(content, fileName);
      return true;
    } catch (error) {
      console.error('Export error:', error);
      alert(error.message);
      return false;
    }
  }, [generateCSVContent, downloadCSV]);

  return exportPostsToCSV;
};

export default useCSVExport;