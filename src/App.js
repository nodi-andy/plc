import { Routes, Route } from 'react-router-dom';
import { useState, useEffect  } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';

import Home from './components/Home';
import NavBar from './components/NavBar';
import EditDialog from './components/EditDialog';
import Header from './components/header/header';
import RenameDialog from './components/RenameDialog';
import SelectFileDialog from './components/SelectFileDialog';
import ConnectionDialog from './components/ConnectionDialog';
import InventoryMenu from './components/InventoryMenu';

import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';

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
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [items, setItems] = useState({ 
    basic: [ {name: 'Bit', icon: <InboxIcon style={{ fontSize: 40, color: '#fff' }} />, quantity: 5, disabled: false} ] ,
    logic: [ {name: 'Number',  icon: <DraftsIcon style={{ fontSize: 40, color: '#fff' }} />, quantity: 2, disabled: true }],
    time:  [ {name: 'Connector',  icon: <SendIcon style={{ fontSize: 40, color: '#fff' }} />, quantity: 10, disabled: false }],
    // Add more items with appropriate categories
    });
  


  const handleItemClick = (item) => {
    console.dlog(`Item clicked: ${item.name}`);
    // Add your custom logic here
  };
  
  useEffect(() => {
    const canvas = document.getElementById('mycanvas');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial sizing
    resizeCanvas();

    // Listen for window resize events and resize the canvas accordingly
    window.addEventListener('resize', resizeCanvas);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []); // Empty dependency array ensures this effect runs only once


  return (
    <div>
      <ThemeProvider theme={theme}>
        {/* Move this div out of the zIndex controlled area */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Header setOpenDrawer={setOpenDrawer} showConnection={setShowConnection}  />
          <NavBar openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} showSaveAsFiles={setShowSaveAsFiles}  showFiles={setShowFiles} showConnection = {showConnection}/>
          <EditDialog showEditMenu={showEditMenu} setShowEditMenu = {setShowEditMenu} />
          <RenameDialog visible = {showSaveAsFiles} show = {setShowSaveAsFiles} filename = {localStorage.selected} saveAs = {true}/>
          <SelectFileDialog openFD={showFiles}  setOpenFD={setShowFiles}/>
          <ConnectionDialog openFD={showConnection}  setOpenFD={setShowConnection}/>
        </div>

        {
        /* 
          <InventoryMenu items={items} onItemClick={handleItemClick} />
          */
        }

        <canvas
          id="mycanvas"
          style={{ position: 'absolute', left: 0, top: 0}}
        />
        
        <Routes>
          {/* Public routes */}
          <Route index element={<Home setShowEditMenu = {setShowEditMenu}/>} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;