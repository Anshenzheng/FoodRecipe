import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Tag,
  Spin,
  Empty,
  Pagination,
  Select,
  Input,
  Button,
} from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { recipeApi, categoryApi, cuisineApi, tasteApi } from '../api';

const { Option } = Select;
const { Meta } = Card;

function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [tastes, setTastes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [selectedTaste, setSelectedTaste] = useState(null);

  useEffect(() => {
    fetchFilters();
    
    const urlKeyword = searchParams.get('keyword');
    const urlCategoryId = searchParams.get('category_id');
    
    if (urlKeyword) {
      setKeyword(urlKeyword);
    }
    if (urlCategoryId) {
      setSelectedCategory(parseInt(urlCategoryId));
    }
    
    fetchRecipes(1, urlKeyword, urlCategoryId);
  }, [searchParams]);

  const fetchFilters = async () => {
    try {
      const [catRes, cuiRes, tasteRes] = await Promise.all([
        categoryApi.getAll(),
        cuisineApi.getAll(),
        tasteApi.getAll(),
      ]);
      setCategories(catRes.data);
      setCuisines(cuiRes.data);
      setTastes(tasteRes.data);
    } catch (error) {
      console.error('获取筛选条件失败:', error);
    }
  };

  const fetchRecipes = async (page = 1, searchKeyword = keyword, categoryId = selectedCategory) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 12,
      };

      if (searchKeyword) {
        params.keyword = searchKeyword;
      }
      if (categoryId) {
        params.category_id = categoryId;
      }
      if (selectedCuisine) {
        params.cuisine_id = selectedCuisine;
      }
      if (selectedTaste) {
        params.taste_id = selectedTaste;
      }

      const response = await recipeApi.getAll(params);
      setRecipes(response.data.recipes || []);
      setTotal(response.data.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRecipes(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    fetchRecipes(1, keyword, value);
  };

  const handleCuisineChange = (value) => {
    setSelectedCuisine(value);
    fetchRecipes(1);
  };

  const handleTasteChange = (value) => {
    setSelectedTaste(value);
    fetchRecipes(1);
  };

  const handlePageChange = (page) => {
    fetchRecipes(page);
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory(null);
    setSelectedCuisine(null);
    setSelectedTaste(null);
    fetchRecipes(1, '', null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>搜索食谱</h1>
        <p>发现美味，探索更多美食可能性</p>
      </div>

      <div className="filter-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input.Search
              placeholder="搜索食谱名称..."
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="选择分类"
              allowClear
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="选择菜系"
              allowClear
              value={selectedCuisine}
              onChange={handleCuisineChange}
            >
              {cuisines.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="选择口味"
              allowClear
              value={selectedTaste}
              onChange={handleTasteChange}
            >
              {tastes.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={3}>
            <Button onClick={handleClearFilters} block>
              清除筛选
            </Button>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {recipes.length > 0 ? (
          <>
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

            {total > 12 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Pagination
                  current={currentPage}
                  pageSize={12}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description="未找到相关食谱，请尝试其他搜索条件"
            style={{ padding: '60px 0' }}
          />
        )}
      </Spin>
    </div>
  );
}

export default Search;
