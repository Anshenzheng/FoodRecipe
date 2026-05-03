import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  message,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { categoryApi, cuisineApi, tasteApi, recipeApi } from '../api';
import { useAuth } from '../context/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

function AddRecipe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [tastes, setTastes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
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
      console.error('获取选项失败:', error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const recipeData = {
        title: values.title,
        description: values.description,
        cover_image: values.cover_image,
        difficulty: values.difficulty,
        cook_time: values.cook_time,
        servings: values.servings,
        category_id: values.category_id,
        cuisine_id: values.cuisine_id,
        taste_id: values.taste_id,
        author_id: user.id,
        ingredients: values.ingredients || [],
        steps: values.steps || [],
      };

      await recipeApi.create(recipeData);
      message.success('食谱提交成功！等待管理员审核后即可发布。');
      navigate('/my-recipes');
    } catch (error) {
      message.error(error.response?.data?.error || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <h1>分享食谱</h1>
        <p>分享您的独家菜谱，让更多人品尝到美味</p>
      </div>

      <Card className="add-recipe-form">
        <h2>基本信息</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            difficulty: '中等',
            servings: 2,
            ingredients: [{ name: '', quantity: '' }],
            steps: [{ description: '', image: '' }],
          }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="食谱名称"
                rules={[{ required: true, message: '请输入食谱名称' }]}
              >
                <Input placeholder="例如：红烧肉、番茄炒蛋" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="cover_image"
                label="封面图片URL"
              >
                <Input placeholder="请输入图片链接（可选）" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="简介"
            rules={[{ required: true, message: '请输入食谱简介' }]}
          >
            <TextArea
              rows={3}
              placeholder="简单介绍这道菜的特点、口味等..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={[24, 0]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="category_id"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="选择分类" size="large">
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="cuisine_id"
                label="菜系"
              >
                <Select placeholder="选择菜系（可选）" size="large" allowClear>
                  {cuisines.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="taste_id"
                label="口味"
              >
                <Select placeholder="选择口味（可选）" size="large" allowClear>
                  {tastes.map((t) => (
                    <Option key={t.id} value={t.id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="difficulty"
                label="难度"
              >
                <Select size="large">
                  <Option value="简单">简单</Option>
                  <Option value="中等">中等</Option>
                  <Option value="困难">困难</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cook_time"
                label="烹饪时间"
              >
                <Input placeholder="例如：30分钟、1小时" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="servings"
                label="份量（人份）"
              >
                <InputNumber min={1} max={20} size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <h2>食材清单</h2>
          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 12 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '请输入食材名称' }]}
                      style={{ marginBottom: 0, width: 200 }}
                    >
                      <Input placeholder="食材名称" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      style={{ marginBottom: 0, width: 150 }}
                    >
                      <Input placeholder="用量" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加食材
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <h2>做法步骤</h2>
          <Form.List name="steps">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    title={`步骤 ${index + 1}`}
                    style={{ marginBottom: 16 }}
                    extra={
                      fields.length > 1 ? (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      ) : null
                    }
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: '请输入步骤描述' }]}
                      style={{ marginBottom: 8 }}
                    >
                      <TextArea rows={2} placeholder="详细描述这一步的操作..." />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'image']}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="步骤图片URL（可选）" />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加步骤
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large" loading={loading}>
                提交食谱
              </Button>
              <Button size="large" onClick={() => navigate(-1)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default AddRecipe;
