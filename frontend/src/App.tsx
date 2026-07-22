import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 前台
import PublicLayout from './pages/public/Layout';
import HomePage     from './pages/public/HomePage';
import DetailPage   from './pages/public/DetailPage';

// 后台
import LoginPage    from './pages/admin/LoginPage';
import AdminLayout  from './pages/admin/Layout';
import DashPage     from './pages/admin/DashPage';
import DocsPage     from './pages/admin/DocsPage';
import CatsPage     from './pages/admin/CatsPage';
import TrashPage    from './pages/admin/TrashPage';
import LogsPage     from './pages/admin/LogsPage';

dayjs.locale('zh-cn');

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif",
      }
    }}>
      <Routes>
        {/* 前台路由 */}
        <Route element={<PublicLayout />}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/doc/:id"   element={<DetailPage />} />
        </Route>

        {/* 后台登录 */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* 后台路由（需登录） */}
        <Route path="/admin" element={
          <PrivateRoute><AdminLayout /></PrivateRoute>
        }>
          <Route index                element={<DashPage />} />
          <Route path="docs"          element={<DocsPage />} />
          <Route path="categories"    element={<CatsPage />} />
          <Route path="trash"         element={<TrashPage />} />
          <Route path="logs"          element={<LogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
}
