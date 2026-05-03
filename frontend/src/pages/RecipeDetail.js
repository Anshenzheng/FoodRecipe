import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Tag,
  Spin,
  Empty,
  Button,
  List,
  Image,
  Space,
  Avatar,
  Input,
  Rate,
  message,
  Divider,
} from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  CommentOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { recipeApi, favoriteApi, commentApi } from '../api';
import { useAuth } from '../context/AuthContext';

const { TextArea } = Input;
const { Meta } = Card;

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      const response = await recipeApi.getById(id);
      setRecipe(response.data);
      
      if (user) {
        const favResponse = await favoriteApi.getByUser(user.id);
        const favorite = favResponse.data.find(f => f.recipe_id === parseInt(id));
        if (favorite) {
          setIsFavorited(true);
          setFavoriteId(favorite.id);
        }
      }

      const commentResponse = await commentApi.getByRecipe(id);
      setComments(commentResponse.data);
    } catch (error) {
      console.error('获取食谱详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await favoriteApi.remove(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
        message.success('已取消收藏');
      } else {
        const response = await favoriteApi.add({
          user_id: user.id,
          recipe_id: recipe.id,
        });
        setIsFavorited(true);
        setFavoriteId(response.data.favorite.id);
        message.success('收藏成功');
      }
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setCommentLoading(true);
    try {
      const response = await commentApi.create({
        user_id: user.id,
        recipe_id: recipe.id,
        content: newComment,
        rating,
      });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      setRating(5);
      message.success('评论成功');
    } catch (error) {
      message.error('评论失败');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ padding: '60px 0' }}>
        <Empty description="食谱不存在" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 'bold' }}>
                {recipe.title}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                {recipe.author && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar icon={<UserOutlined />} />
                    <span>{recipe.author.username}</span>
                  </div>
                )}
                <span style={{ color: '#999' }}>
                  发布于 {new Date(recipe.created_at).toLocaleDateString()}
                </span>
              </div>

              <Image
                src={
                  recipe.cover_image ||
                  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20food%20dish%20professional%20photography&image_size=landscape_16_9'
                }
                alt={recipe.title}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px' }}
              />
            </div>

            <div className="recipe-meta" style={{ marginBottom: '24px' }}>
              {recipe.difficulty && (
                <span className="recipe-meta-item">
                  <FireOutlined />
                  难度: {recipe.difficulty}
                </span>
              )}
              {recipe.cook_time && (
                <span className="recipe-meta-item">
                  <ClockCircleOutlined />
                  烹饪时间: {recipe.cook_time}
                </span>
              )}
              {recipe.servings && (
                <span className="recipe-meta-item">
                  <UserOutlined />
                  份量: {recipe.servings}人份
                </span>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Space size={[8, 8]} wrap>
                {recipe.category && (
                  <Tag color="orange">{recipe.category.name}</Tag>
                )}
                {recipe.cuisine && (
                  <Tag color="green">{recipe.cuisine.name}</Tag>
                )}
                {recipe.taste && (
                  <Tag color="purple">{recipe.taste.name}</Tag>
                )}
              </Space>
            </div>

            {recipe.description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                  简介
                </h3>
                <p style={{ color: '#666', lineHeight: '1.8' }}>{recipe.description}</p>
              </div>
            )}

            <Divider />

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                食材清单
              </h3>
              <List
                className="ingredient-list"
                dataSource={recipe.ingredients || []}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span className="ingredient-name">{item.name}</span>
                      <span className="ingredient-quantity">{item.quantity}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <Divider />

            <div>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                做法步骤
              </h3>
              {recipe.steps && recipe.steps.length > 0 ? (
                recipe.steps.map((step, index) => (
                  <Card key={step.id} className="step-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <span className="step-number">{step.step_number}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ lineHeight: '1.8', marginBottom: step.image ? '12px' : 0 }}>
                          {step.description}
                        </p>
                        {step.image && (
                          <Image
                            src={step.image}
                            alt={`步骤 ${step.step_number}`}
                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Empty description="暂无步骤" />
              )}
            </div>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
              <CommentOutlined style={{ marginRight: '8px' }} />
              评论 ({comments.length})
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ marginRight: '8px' }}>评分:</span>
                <Rate value={rating} onChange={setRating} />
              </div>
              <TextArea
                rows={3}
                placeholder="写下你的评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ marginBottom: '12px' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmitComment}
                loading={commentLoading}
              >
                发表评论
              </Button>
            </div>

            <Divider />

            {comments.length > 0 ? (
              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar icon={<UserOutlined />} />
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{comment.user?.username || '用户'}</span>
                          <Rate value={comment.rating} disabled style={{ fontSize: '12px' }} />
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ color: '#333', marginTop: '8px' }}>{comment.content}</p>
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无评论，快来抢沙发吧！" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Space size={[16, 16]}>
                <Button
                  type={isFavorited ? 'primary' : 'default'}
                  icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleFavorite}
                  size="large"
                >
                  {isFavorited ? '已收藏' : '收藏'}
                </Button>
                <Button icon={<ShareAltOutlined />} size="large">
                  分享
                </Button>
              </Space>
            </div>

            <Divider />

            <div>
              <h4 style={{ marginBottom: '12px', fontWeight: 'bold' }}>食谱信息</h4>
              <List
                size="small"
                dataSource={[
                  { label: '分类', value: recipe.category?.name || '未分类' },
                  { label: '菜系', value: recipe.cuisine?.name || '不限' },
                  { label: '口味', value: recipe.taste?.name || '不限' },
                  { label: '难度', value: recipe.difficulty || '中等' },
                  { label: '烹饪时间', value: recipe.cook_time || '未知' },
                  { label: '份量', value: recipe.servings ? `${recipe.servings}人份` : '未知' },
                  { label: '发布时间', value: new Date(recipe.created_at).toLocaleDateString() },
                  { label: '状态', value: recipe.status === 'approved' ? '已通过' : recipe.status === 'pending' ? '审核中' : '已拒绝' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ color: '#666' }}>{item.label}</span>
                      <span style={{ fontWeight: '500' }}>{item.value}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default RecipeDetail;
