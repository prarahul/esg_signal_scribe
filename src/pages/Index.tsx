import { ESGDashboard } from '@/components/ESGDashboard';
import { Link } from 'react-router-dom';
import { EnvWarning } from '@/components/EnvWarning';

const Index = () => {
  return (
    <div>
      <EnvWarning />
      <div className="w-full bg-blue-50 text-blue-800 text-xs py-2 text-center">
        <Link className="underline" to="/model">View Model Diagnostics</Link>
      </div>
      <ESGDashboard />
    </div>
  );
};

export default Index;
