import React, { useState } from "react";
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Button,
  List,
  Tab,
  Tabs,
  Grid
} from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import SendAndArchiveOutlinedIcon from '@mui/icons-material/SendAndArchiveOutlined';
import WifiIcon from '@mui/icons-material/Wifi';
import LoadingButton from '@mui/lab/LoadingButton';
import UpdateIcon from '@mui/icons-material/Update';
import RenameDialog from './RenameDialog';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';

function SelectFileDialog({ openFD, setOpenFD }) {
  const [renameDialogVisible, showRenameDialog] = useState(false);
  const [filename, setFilename] = useState("");

  const handleRename = (newFileName) => {
    setFilename(newFileName);
    showRenameDialog(true);
  };


  const handleClose = () => {
    setOpenFD(false);
  };

  return (
      <Dialog open={openFD} onClose={handleClose}>
        <DialogTitle>Files</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', }}>
            <List>
              { localStorage.files ? 
                Object.keys(JSON.parse(localStorage.files)).map((label) => (
                  <ListItem key={label} disablePadding>
                    <ListItemButton>
                      <ListItemText primary={label} onClick={() => {window.load(label); handleClose()} }/>
                    </ListItemButton>
                  </ListItem>
                )) : <></>
            }
            </List>
            <List>
              {localStorage.files ? Object.keys(JSON.parse(localStorage.files)).map((label) => (
                  <ListItem key={label} disablePadding>
                    <ListItemButton onClick={ ()=>handleRename(label) }>
                      <DriveFileRenameOutlineIcon />
                    </ListItemButton>
                    <ListItemButton>
                      <DeleteOutlineIcon />
                    </ListItemButton>
                  </ListItem>
              )) : <></>
            }
            </List>
        </Box>
        <RenameDialog visible = {renameDialogVisible} show = {showRenameDialog} filename = {filename} saveAs = {false}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
  );
}


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  display: "flex",
  flexDirection: "row",
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function ConnectionDialog({ openFD, setOpenFD }) {
  const [selectedValue, setSelectedValue] = useState('nowifi');
  const [selectedPassword, setSelectedPassword] = useState('nowifi');
  const [wifiList, setWifiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSaveWiFiPassword, setLoadingSaveWiFiPassword] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isWiFiEnabled, setEnabled] = useState(false);
  const [isDirectConnectionEnabled, setDirectConnectionEnabled] = useState(true);

  const handleToggle = (e, v) => {
    setEnabled(v);
    window.ws.sendMsg(JSON.stringify({'Setting': {'STA_Enabled' : Number(v)}}))
  };

  const handleDirectConnectionToggle = (e, v) => {
    setDirectConnectionEnabled(v);
    window.ws.sendMsg(JSON.stringify({'Setting': {'AP_Enabled' : Number(v)}}))
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSSIDChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const passwordChange = (event) => {
    setSelectedPassword(event.target.value);
  };
  const handleClose = () => {
    setOpenFD(false);
  };

  function updateWiFiList(){
    if (window.ws.readyState == 1) {
        window.ws.sendMsg(JSON.stringify({'listWiFi':1}))
    }
    setLoading(true);
  }

  function saveWiFiPassword(){
    if (window.ws.readyState == 1) {
        window.ws.sendMsg(JSON.stringify({'saveWiFi':{SSID:selectedValue, PW:selectedPassword}}))
    }
    setLoadingSaveWiFiPassword(true);
  }

  window.setWiFiEnabled = (enabled) => {
    setEnabled(enabled == 1);
  }
  window.wifiListArrived = (list) => {
    setWifiList(list);
    setSelectedValue(window.selectedWiFi || list[0]);
    setLoading(false);
  }

  window.wifiStored = (wifiCred) => {
    setSelectedValue(wifiCred.SSID);
    setLoadingSaveWiFiPassword(false);
  }

  {/*
  const [port, setPort] = useState(null);

  async function requestSerialPort() {
    try {
      const requestedPort = await navigator.serial.requestPort();
      const portInfo = await requestedPort.getInfo();
      const portName = portInfo.serialNumber || portInfo.deviceName;
      setPort({ name: portName });
    } catch (error) {
      console.error("Error requesting serial port:", error);
    }
  }
*/}


  return (
      <Dialog open={openFD} onClose={handleClose}>
        <DialogTitle>Connections</DialogTitle>
        <DialogContent>

        <Grid container spacing={2}>
        <Grid item xs={12}>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={isDirectConnectionEnabled} onChange={handleDirectConnectionToggle} />}
            label="Direct Connection"
          />
          <Item>{isDirectConnectionEnabled ? "Enabled" : "Disabled"}</Item>
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={isWiFiEnabled} onChange={handleToggle} />}
            label="WiFi"
          />
          <Item>
          <FormControl fullWidth>
            <InputLabel id="wifiLabel">WiFi name</InputLabel>
            <Select disabled = {!isWiFiEnabled} value={selectedValue} onChange={handleSSIDChange}
              labelId="selectLabel1"
              id="selectID1"
              label="WiFi name"
              >
              {Array.isArray(wifiList) && wifiList.map(wifi => (
                  <MenuItem key={wifi} value={wifi}>
                    {wifi}
                  </MenuItem>
              ))}
                {Array.isArray(wifiList) == false &&
                  <MenuItem selected key={"nowifi"} value={"nowifi"}>
                    No WiFi 
                  </MenuItem>
              }
            </Select>

          </FormControl>
          <LoadingButton disabled = {!isWiFiEnabled} onClick={updateWiFiList} loading={loading}  loadingPosition="start" startIcon={<UpdateIcon />} variant="outlined">Update</LoadingButton>
          </Item>

            <Item>
          <FormControl fullWidth>
            <InputLabel disabled = {!isWiFiEnabled}  htmlFor="outlined-adornment-password">{"WiFi Password for " + selectedValue}</InputLabel>
            <OutlinedInput
              labelId="selectPassword"
              id="selectPassword"
              type={showPassword ? 'text' : 'password'}
              label = {"WiFi Password for " + selectedValue}
              disabled = {!isWiFiEnabled}
              onChange={passwordChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    disabled = {!isWiFiEnabled}
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            </FormControl>
            <LoadingButton disabled = {!isWiFiEnabled} onClick={saveWiFiPassword} loading={loadingSaveWiFiPassword}  loadingPosition="start" startIcon={<UpdateIcon />} variant="outlined">Save</LoadingButton>
            </Item>
          </FormGroup>
        </Grid>

      </Grid>

{/*
        <FormControl fullWidth>
        <div onClick={requestSerialPort}>
          Serial Port: {port && <p>Connected</p>}
          {!port && <button >Request Access</button>}
        </div>
      </FormControl>
*/}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
  );
}
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}


function SelectNodeDialog({ openND, setOpenND }) {
  const handleClose = () => {
    setOpenND(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <Dialog open={openND} onClose={handleClose} fullWidth={true} maxWidth={"xl"} >
      <DialogContent >

            <Tabs sx={{ borderBottom: 1 }}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              value={value} onChange={handleChange} aria-label="basic tabs example"
              TabIndicatorProps={{style: {backgroundColor: "red"}}}
            >
              
              {window.nodes?.list && Object.keys(window.nodes.list).map((category, index) => (
                <Tab key={category} label={category} {...a11yProps(index)} />
              ))}
            </Tabs>
              {window.nodes?.list && Object.keys(window.nodes.list).map((category, tabIndex) => (
              <TabPanel key={category} value={value} index={tabIndex}>
                  <Grid container spacing={2}>
                    {window.nodes.list[category].map((label) => (
                      <Grid key={label} item>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            window.nodes.addNode(`${category}/${label}`);
                            setOpenND(false);
                          }}>
                          {label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
              </TabPanel>
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SimpleSnackbar({openSB, setopenSB, sbMessage}) {

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setopenSB(false);
  };

  const action = (
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
      </IconButton>
  );

  return (
    <div>
      <Snackbar
        open={openSB}
        autoHideDuration={6000}
        onClose={handleClose}
        message={sbMessage}
        action={action}
      />
    </div>
  );
}

function LeftActionButtons({ showConnection }) {
  const [burnClickable, setBurnClickable] = useState(false)
  window.showBurn = (v) => {
    setBurnClickable(v);
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: (theme) => theme.spacing(2),
        bottom: (theme) => theme.spacing(2),
        top: (theme) => theme.spacing(2),
        justifyContent: 'start',
        gap: 2,
        m: 0.5
      }}>
      
      {false &&  <Fab variant="extended" onClick={()=>showConnection(true)}>
        <WifiIcon />
      </Fab> }
      <Fab
        color="error"
        variant="extended"
        disabled = {!burnClickable}
        onClick={() => {
          window.nodes.upload();
        }}>
        <SendAndArchiveOutlinedIcon />
      </Fab>
    </Box>
  );
}

function RightActionButtons({ showFiles, showNodes, showSaveAsFiles }) {
  const [editClickable, setEditClickable] = useState(false)
  const [removeClickable, setRemoveClickable] = useState(false)
  window.showEdit = (v) => {
    setEditClickable(v);
  };
  window.showRemove = (v) => {
    setRemoveClickable(v);
  };

  return (
    <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        position: 'fixed',
        bottom: (theme) => theme.spacing(2),
        top: (theme) => theme.spacing(2),
        right: (theme) => theme.spacing(2),
        gap: 2,
        m: 0.5
      }}>

      <Fab color="info" variant="extended" onClick={()=>showFiles(true)}>
        <FileOpenOutlinedIcon />
      </Fab>
      <Fab
        color="success"
        variant="extended"
        onClick={() => {
          window.nodes.saveNodework();
        }}>
        <SaveOutlinedIcon />
      </Fab>
      <Fab color="info" variant="extended" onClick={showSaveAsFiles}>
        <SaveAsOutlinedIcon />
      </Fab>

      <Box sx={{
        display: 'flex',
        flexGrow: 2,
      }}></Box>
      <Fab
        color="warning"
        variant="extended"
        disabled = {!editClickable}
        onClick={() => {
          window.nodes.editNode();
        }}>
        <EditIcon />
      </Fab>
      <Fab
        color="secondary"
        variant="extended"
        aria-label="remove"
        disabled = {!removeClickable}
        onClick={() => {
          window.nodes.remNode();
        }}>
        <DeleteOutlineIcon />
      </Fab>
      <Fab color="primary" variant="extended" aria-label="add" onClick={()=>showNodes(true)}>
        <AddIcon />
      </Fab>
    </Box>
    </>
  );
}

export default function Home() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showNodes, setShowNodes] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [showSaveAsFiles, setShowSaveAsFiles] = useState(false);
  const [, setFilename] = useState("");

  window.setFilename = (fn) => {setFilename(fn)}
  window.showSnackbar = (msg) => {window.messageText = msg; setSnackbarOpen(true)}

  return (
    <>
      <SelectNodeDialog openND={showNodes}  setOpenND={setShowNodes}/>
      <SelectFileDialog openFD={showFiles}  setOpenFD={setShowFiles}/>
      <ConnectionDialog openFD={showConnection}  setOpenFD={setShowConnection}/>
      <SimpleSnackbar openSB={snackbarOpen}  setopenSB={setSnackbarOpen} sbMessage = {window.messageText}/>
      <RenameDialog visible = {showSaveAsFiles} show = {setShowSaveAsFiles} filename = {localStorage.selected} saveAs = {true}/>
      
      <LeftActionButtons
        sx={{
          position: 'fixed',
          left: (theme) => theme.spacing(2),
          my: 8
        }}
        showConnection={setShowConnection}
      />
      <RightActionButtons
        sx={{
          position: 'fixed',
          right: (theme) => theme.spacing(2),
          my: 18
        }}
        showFiles={setShowFiles}
        showNodes={setShowNodes}
        showSaveAsFiles={setShowSaveAsFiles}
      />
    </>
  );
}
