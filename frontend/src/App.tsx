import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CreateWorkflow from './pages/CreateWorkflow';
import Workflows from './pages/Workflows';
import WorkflowDetails from './pages/WorkflowDetails';
import Compare from './pages/Compare';
import Shiva from './pages/Shiva';
import './index.css';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateWorkflow />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/:id" element={<WorkflowDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/shiva" element={<Shiva />} />
          <Route path="/settings" element={<div className="text-center py-12 text-retro-cyan opacity-50">Settings coming soon...</div>} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
