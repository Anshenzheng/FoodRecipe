import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Spin,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { recipeApi, categoryApi, cuisineApi, tasteApi } from '../api';

const { TabPane } = Tabs;
const { TextArea } = Input;

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recipes');
  const [loading, setLoading] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [tastes, setTastes] = useState([]);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm] = Form.useForm();

  const [cuisineModalVisible, setCuisineModalVisible] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState(null);
  const [cuisineForm] = Form.useForm();

  const [tasteModalVisible, setTasteModalVisible] = useState(false);
  const [editingTaste, setEditingTaste] = useState(null);
  const [tasteForm] = Form.useForm();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [recipesRes, catRes, cuiRes, tasteRes] = await Promise.all([
        recipeApi.getAll({ status: '', per_page: 100 }),
        categoryApi.getAll(),
        cuisineApi.getAll(),
        tasteApi.getAll(),
      ]);

      const allRecipes = recipesRes.data.recipes || [];
      setRecipes(allRecipes);
      setCategories(catRes.data);
      setCuisines(cuiRes.data);
      setTastes(tasteRes.data);

      setStats({
        total: recipesRes.data.total || 0,
        pending: allRecipes.filter(r => r.status === 'pending').length,
        approved: allRecipes.filter(r => r.status === 'approved').length,
        rejected: allRecipes.filter(r => r.status === 'rejected').length,
      });
    } catch (error) {
      console.error('获取数据失败:', error);
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

  const handleApproveRecipe = async (recipeId) => {
    try {
      await recipeApi.approve(recipeId);
      message.success('食谱已批准');
      fetchAllData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleRejectRecipe = async (recipeId) => {
    try {
      await recipeApi.reject(recipeId);
      message.success('食谱已拒绝');
      fetchAllData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await recipeApi.delete(recipeId);
      message.success('删除成功');
      fetchAllData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleViewRecipe = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const openCategoryModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      categoryForm.setFieldsValue(category);
    } else {
      categoryForm.resetFields();
    }
    setCategoryModalVisible(true);
  };

  const handleCategorySubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, values);
        message.success('更新成功');
      } else {
        await categoryApi.create(values);
        message.success('创建成功');
      }
      setCategoryModalVisible(false);
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await categoryApi.delete(categoryId);
      message.success('删除成功');
      fetchAllData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const openCuisineModal = (cuisine = null) => {
    setEditingCuisine(cuisine);
    if (cuisine) {
      cuisineForm.setFieldsValue(cuisine);
    } else {
      cuisineForm.resetFields();
    }
    setCuisineModalVisible(true);
  };

  const handleCuisineSubmit = async (values) => {
    try {
      if (editingCuisine) {
        message.warning('菜系暂不支持修改');
      } else {
        await cuisineApi.create(values);
        message.success('创建成功');
      }
      setCuisineModalVisible(false);
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const openTasteModal = (taste = null) => {
    setEditingTaste(taste);
    if (taste) {
      tasteForm.setFieldsValue(taste);
    } else {
      tasteForm.resetFields();
    }
    setTasteModalVisible(true);
  };

  const handleTasteSubmit = async (values) => {
    try {
      if (editingTaste) {
        message.warning('口味暂不支持修改');
      } else {
        await tasteApi.create(values);
        message.success('创建成功');
      }
      setTasteModalVisible(false);
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const recipeColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '食谱名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: ['author', 'username'],
      key: 'author',
      render: (text) => text || '-',
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewRecipe(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleApproveRecipe(record.id)}>
                批准
              </Button>
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleRejectRecipe(record.id)}>
                拒绝
              </Button>
            </>
          )}
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

  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openCategoryModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个分类吗？"
            onConfirm={() => handleDeleteCategory(record.id)}
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
    <div style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <h1>管理后台</h1>
        <p>管理食谱分类、审核用户发布的内容</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="食谱总数"
              value={stats.total}
              prefix={<FireOutlined style={{ color: '#ff6b35' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已通过"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已拒绝"
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
        >
          <TabPane tab="食谱管理" key="recipes">
            <Card>
              <Table
                columns={recipeColumns}
                dataSource={recipes}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="分类管理" key="categories">
            <Card
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openCategoryModal()}
                >
                  新增分类
                </Button>
              }
            >
              <Table
                columns={categoryColumns}
                dataSource={categories}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </TabPane>

          <TabPane tab="菜系管理" key="cuisines">
            <Card
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openCuisineModal()}
                >
                  新增菜系
                </Button>
              }
            >
              <Table
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                  { title: '名称', dataIndex: 'name', key: 'name' },
                  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
                ]}
                dataSource={cuisines}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </TabPane>

          <TabPane tab="口味管理" key="tastes">
            <Card
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openTasteModal()}
                >
                  新增口味
                </Button>
              }
            >
              <Table
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                  { title: '名称', dataIndex: 'name', key: 'name' },
                ]}
                dataSource={tastes}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Spin>

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        footer={null}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="例如：家常菜、主食" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="分类描述" />
          </Form.Item>
          <Form.Item
            name="sort_order"
            label="排序"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setCategoryModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增菜系"
        open={cuisineModalVisible}
        onCancel={() => setCuisineModalVisible(false)}
        footer={null}
      >
        <Form
          form={cuisineForm}
          layout="vertical"
          onFinish={handleCuisineSubmit}
        >
          <Form.Item
            name="name"
            label="菜系名称"
            rules={[{ required: true, message: '请输入菜系名称' }]}
          >
            <Input placeholder="例如：川菜、粤菜" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="菜系描述" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setCuisineModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增口味"
        open={tasteModalVisible}
        onCancel={() => setTasteModalVisible(false)}
        footer={null}
      >
        <Form
          form={tasteForm}
          layout="vertical"
          onFinish={handleTasteSubmit}
        >
          <Form.Item
            name="name"
            label="口味名称"
            rules={[{ required: true, message: '请输入口味名称' }]}
          >
            <Input placeholder="例如：麻辣、酸甜" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setTasteModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Admin;
