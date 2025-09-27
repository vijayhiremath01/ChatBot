import React from 'react';
import Layout from './Layout';

export default function LayoutExample() {
  return (
    <Layout>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Layout Component Example
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          This demonstrates the Layout component with proper dark theme styling.
        </p>
        <button 
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Styled Button
        </button>
      </div>
    </Layout>
  );
}



