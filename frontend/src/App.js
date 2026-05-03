import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRecipe from './pages/AddRecipe';
import Favorites from './pages/Favorites';
import MyRecipes from './pages/MyRecipes';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';

const { Content } = Layout;

function App() {
  const { user, isAdmin } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '0 50px', marginTop: '24px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/add-recipe"
            element={user && !isAdmin() ? <AddRecipe /> : <Navigate to="/" />}
          />
          <Route
            path="/favorites"
            element={user && !isAdmin() ? <Favorites /> : <Navigate to="/" />}
          />
          <Route
            path="/my-recipes"
            element={user && !isAdmin() ? <MyRecipes /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={isAdmin() ? <Admin /> : <Navigate to="/" />}
          />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  );
}

export default App;
