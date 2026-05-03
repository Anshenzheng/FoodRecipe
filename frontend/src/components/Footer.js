import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

function Footer() {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        marginTop: '40px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b35' }}>
            🍳 美食食谱分享平台
          </span>
        </div>
        <p style={{ color: '#666', marginBottom: '8px' }}>
          分享美食，分享生活，让每一餐都充满爱
        </p>
        <p style={{ color: '#999', fontSize: '12px' }}>
          © 2026 美食食谱分享平台. All rights reserved.
        </p>
      </div>
    </AntFooter>
  );
}

export default Footer;
