import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MonsterList from './components/MonsterList';
import TypeList from './components/TypeList';
import './App.css';

// MonsterDetail component will be implemented in a future update
const MonsterDetail = () => <div>Monster Detail Coming Soon</div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monsters" element={<MonsterList />} />
          <Route path="/monsters/:id" element={<MonsterDetail />} />
          <Route path="/types" element={<TypeList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
