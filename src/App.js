import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';

import Home from './components/Home';
import NavBar from './components/NavBar';
import Header from './components/header/header';
import RenameDialog from './components/RenameDialog';
import SelectFileDialog from './components/SelectFileDialog';
import ConnectionDialog from './components/ConnectionDialog';

console.log('📦: ' + process.env.REACT_APP_NAME)
console.log('🚀: ' + process.env.REACT_APP_VERSION)

const theme = createTheme({
  palette: {
    primary: {
      main: blue[800],
    },
  },
});

function App() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showSaveAsFiles, setShowSaveAsFiles] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  

  return (
    <div>
      <ThemeProvider theme={theme}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <NavBar openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} showSaveAsFiles={setShowSaveAsFiles}  showFiles={setShowFiles}/>
        <Header openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} showConnection={setShowConnection}  />
        <RenameDialog visible = {showSaveAsFiles} show = {setShowSaveAsFiles} filename = {localStorage.selected} saveAs = {true}/>
        <SelectFileDialog openFD={showFiles}  setOpenFD={setShowFiles}/>
        <ConnectionDialog openFD={showConnection}  setOpenFD={setShowConnection}/>

      </div>
        <canvas
          id="mycanvas"
          style={{ position: 'absolute', left: 0, top: 0}}
          width={800}
          height={600}
        />
        <Routes>
          {/* Public routes */}
          <Route index element={<Home />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;