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
  Popconfirm,
  message,
} from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { favoriteApi } from '../api';
import { useAuth } from '../context/AuthContext';

const { Meta } = Card;

function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteApi.getByUser(user.id);
      setFavorites(response.data);
    } catch (error) {
      console.error('获取收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await favoriteApi.remove(favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
      message.success('已取消收藏');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleRecipeClick = (recipe) => {
    if (recipe) {
      navigate(`/recipe/${recipe.id}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>我的收藏</h1>
        <p>收藏的美味食谱，随时回看</p>
      </div>

      <Spin spinning={loading}>
        {favorites.length > 0 ? (
          <Row gutter={[24, 24]}>
            {favorites.map((favorite) => {
              const recipe = favorite.recipe;
              if (!recipe) return null;
              
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={favorite.id}>
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
                      <Popconfirm
                        title="确定取消收藏吗？"
                        onConfirm={() => handleRemoveFavorite(favorite.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          取消收藏
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <Meta
                      title={
                        <div
                          style={{ fontWeight: 'bold', marginBottom: '8px', cursor: 'pointer' }}
                          onClick={() => handleRecipeClick(recipe)}
                        >
                          {recipe.title}
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
              );
            })}
          </Row>
        ) : (
          <Empty
            description={
              <div>
                <p style={{ marginBottom: '16px' }}>您还没有收藏任何食谱</p>
                <Button type="primary" onClick={() => navigate('/search')}>
                  去发现美食
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

export default Favorites;
