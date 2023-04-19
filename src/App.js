import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';

console.log('📦: ' + process.env.REACT_APP_NAME)
console.log('🚀: ' + process.env.REACT_APP_VERSION)

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route index element={<Home />} />
    </Routes>
  );
}

export default App;
