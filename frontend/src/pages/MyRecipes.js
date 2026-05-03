import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Tag,
  Spin,
  Empty,
  Button,
  Space,
  Table,
  Popconfirm,
  message,
} from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { recipeApi } from '../api';
import { useAuth } from '../context/AuthContext';

const { Meta } = Card;

function MyRecipes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (user) {
      fetchMyRecipes();
    }
  }, [user]);

  const fetchMyRecipes = async () => {
    setLoading(true);
    try {
      const response = await recipeApi.getByUser(user.id);
      setRecipes(response.data);
    } catch (error) {
      console.error('获取我的食谱失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'approved':
        return <Tag color="green">已通过</Tag>;
      case 'pending':
        return <Tag color="orange">审核中</Tag>;
      case 'rejected':
        return <Tag color="red">已拒绝</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await recipeApi.delete(recipeId);
      setRecipes(recipes.filter(r => r.id !== recipeId));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const columns = [
    {
      title: '食谱名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => handleRecipeClick(record)} style={{ fontWeight: 'bold' }}>
          {text}
        </a>
      ),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => text || '-',
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleRecipeClick(record)}
        >
          查看
        </Button>
        <Popconfirm
          title="确定删除这个食谱吗？"
          onConfirm={() => handleDeleteRecipe(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

  return (
    <div>
      <div className="page-header">
        <h1>我的食谱</h1>
        <p>管理您发布的所有食谱</p>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button.Group>
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              列表视图
            </Button>
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            >
              卡片视图
            </Button>
          </Button.Group>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/add-recipe')}
        >
          发布新食谱
        </Button>
      </div>

      <Spin spinning={loading}>
        {recipes.length > 0 ? (
          viewMode === 'list' ? (
            <Card>
              <Table
                columns={columns}
                dataSource={recipes}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                }}
              />
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {recipes.map((recipe) => (
                <Col xs={24} sm={12} md={8} lg={6} key={recipe.id}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={recipe.title}
                        src={
                          recipe.cover_image ||
                          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20food%20dish%20professional%20photography&image_size=square'
                        }
                        style={{ height: '180px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handleRecipeClick(recipe)}
                      />
                    }
                    actions={[
                      <Button type="text" icon={<EyeOutlined />} onClick={() => handleRecipeClick(recipe)}>
                        查看
                      </Button>,
                      <Popconfirm
                        title="确定删除这个食谱吗？"
                        onConfirm={() => handleDeleteRecipe(recipe.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <Meta
                      title={
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>{recipe.title}</span>
                          <div style={{ marginTop: '4px' }}>{getStatusTag(recipe.status)}</div>
                        </div>
                      }
                      description={
                        <div>
                          <div className="recipe-meta" style={{ marginBottom: 0 }}>
                            {recipe.difficulty && (
                              <span className="recipe-meta-item">
                                <FireOutlined />
                                {recipe.difficulty}
                              </span>
                            )}
                            {recipe.cook_time && (
                              <span className="recipe-meta-item">
                                <ClockCircleOutlined />
                                {recipe.cook_time}
                              </span>
                            )}
                            {recipe.servings && (
                              <span className="recipe-meta-item">
                                <UserOutlined />
                                {recipe.servings}人份
                              </span>
                            )}
                          </div>
                          {recipe.category && (
                            <Tag color="orange" style={{ marginTop: '8px' }}>
                              {recipe.category.name}
                            </Tag>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )
        ) : (
          <Empty
            description={
              <div>
                <p style={{ marginBottom: '16px' }}>您还没有发布任何食谱</p>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add-recipe')}>
                  发布第一个食谱
                </Button>
              </div>
            }
            style={{ padding: '60px 0' }}
          />
        )}
      </Spin>
    </div>
  );
}

export default MyRecipes;
