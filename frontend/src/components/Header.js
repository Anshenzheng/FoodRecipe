import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Button, Input, message } from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
  HeartOutlined,
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;
const { Search } = Input;

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'add-recipe':
        if (user) {
          navigate('/add-recipe');
        } else {
          message.warning('请先登录');
          navigate('/login');
        }
        break;
      case 'favorites':
        if (user) {
          navigate('/favorites');
        } else {
          message.warning('请先登录');
          navigate('/login');
        }
        break;
      case 'my-recipes':
        if (user) {
          navigate('/my-recipes');
        } else {
          message.warning('请先登录');
          navigate('/login');
        }
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        break;
    }
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`);
      setSearchValue('');
    }
  };

  const getUserMenu = () => {
    const items = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: user?.username,
        disabled: true,
      },
      {
        type: 'divider',
      },
      {
        key: 'my-recipes',
        icon: <BookOutlined />,
        label: '我的食谱',
      },
      {
        key: 'favorites',
        icon: <HeartOutlined />,
        label: '我的收藏',
      },
    ];

    if (isAdmin()) {
      items.push(
        { type: 'divider' },
        {
          key: 'admin',
          icon: <SettingOutlined />,
          label: '管理后台',
        }
      );
    }

    items.push(
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
      }
    );

    return {
      items,
      onClick: ({ key }) => {
        if (key === 'logout') {
          logout();
          navigate('/');
          message.success('已退出登录');
        } else {
          handleMenuClick({ key });
        }
      },
    };
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['home'];
    if (path === '/search') return ['search'];
    if (path === '/add-recipe') return ['add-recipe'];
    if (path === '/favorites') return ['favorites'];
    if (path === '/my-recipes') return ['my-recipes'];
    if (path === '/admin') return ['admin'];
    return [];
  };

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: 'bold',
            marginRight: '30px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          🍳 美食食谱分享平台
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            borderBottom: 'none',
          }}
          items={[
            {
              key: 'home',
              icon: <HomeOutlined />,
              label: '首页',
            },
            {
              key: 'search',
              icon: <SearchOutlined />,
              label: '搜索',
            },
            {
              key: 'add-recipe',
              icon: <PlusOutlined />,
              label: '分享食谱',
            },
            ...(user
              ? [
                  {
                    key: 'favorites',
                    icon: <HeartOutlined />,
                    label: '收藏',
                  },
                  {
                    key: 'my-recipes',
                    icon: <BookOutlined />,
                    label: '我的食谱',
                  },
                ]
              : []),
            ...(isAdmin()
              ? [
                  {
                    key: 'admin',
                    icon: <SettingOutlined />,
                    label: '管理后台',
                  },
                ]
              : []),
          ]}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Search
          placeholder="搜索食谱..."
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 250 }}
        />

        {user ? (
          <Dropdown menu={getUserMenu()} placement="bottomRight">
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fff',
              }}
            >
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#fff', color: '#ff6b35' }} />
              <span>{user.username}</span>
            </div>
          </Dropdown>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              type="text"
              style={{ color: '#fff' }}
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              登录
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/register')}
            >
              注册
            </Button>
          </div>
        )}
      </div>
    </AntHeader>
  );
}

export default Header;
