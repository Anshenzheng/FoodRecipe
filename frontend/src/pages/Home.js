import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Input,
  Tag,
  Spin,
  Empty,
  Button,
} from 'antd';
import {
  SearchOutlined,
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HomeOutlined,
  CoffeeOutlined,
  ShopOutlined,
  MedicineBoxOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { categoryApi, recipeApi } from '../api';

const { Search } = Input;
const { Meta } = Card;

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const categoryIcons = {
    '家常菜': <HomeOutlined />,
    '主食': <ShopOutlined />,
    '汤品': <CoffeeOutlined />,
    '甜点': <MedicineBoxOutlined />,
    '饮品': <ThunderboltOutlined />,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, recipesRes] = await Promise.all([
        categoryApi.getAll(),
        recipeApi.getAll({ per_page: 8 }),
      ]);
      setCategories(categoriesRes.data);
      setRecipes(recipesRes.data.recipes || []);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?category_id=${category.id}`);
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div>
      <div className="hero-section">
        <h1>🍳 美食食谱分享平台</h1>
        <p>
          发现美味，分享快乐，探索全球美食的无限可能。
          无论是家常菜还是精致料理，这里都有你想要的。
        </p>
        <div className="hero-search">
          <Search
            placeholder="搜索食谱、食材、做法..."
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                搜索
              </Button>
            }
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <div className="home-categories">
        <h2 className="section-title">热门分类</h2>
        <Row gutter={[16, 16]}>
          {categories.map((category) => (
            <Col xs={12} sm={8} md={6} lg={4} key={category.id}>
              <Card
                hoverable
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div>
                  {categoryIcons[category.name] || <HomeOutlined />}
                  <h3>{category.name}</h3>
                  <p>{category.description || '探索美味'}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="home-recipes">
        <h2 className="section-title">
          <FireOutlined style={{ color: '#ff6b35' }} />
          热门食谱
        </h2>
        <Spin spinning={loading}>
          {recipes.length > 0 ? (
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
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                    }
                    onClick={() => handleRecipeClick(recipe)}
                  >
                    <Meta
                      title={
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
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
              ))}
            </Row>
          ) : (
            <Empty
              description="暂无食谱，快来分享第一道菜谱吧！"
              style={{ padding: '60px 0' }}
            />
          )}
        </Spin>
      </div>
    </div>
  );
}

export default Home;
