import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CreateWorkflow from './pages/CreateWorkflow';
import Workflows from './pages/Workflows';
import WorkflowDetails from './pages/WorkflowDetails';
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
          <Route path="/analytics" element={<div className="text-center py-12 text-gray-500">Analytics coming soon...</div>} />
          <Route path="/settings" element={<div className="text-center py-12 text-gray-500">Settings coming soon...</div>} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
