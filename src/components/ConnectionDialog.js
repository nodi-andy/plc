import React, { useState } from "react";

import LoadingButton from '@mui/lab/LoadingButton';
import UpdateIcon from '@mui/icons-material/Update';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    DialogActions,
    Button
  } from '@mui/material';

  
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    display: "flex",
    flexDirection: "row",
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));
  
export default function ConnectionDialog({ openFD, setOpenFD }) {
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
      window.socket.sendMsg(JSON.stringify({'Setting': {'STA_Enabled' : Number(v)}}))
    };
  
    const handleDirectConnectionToggle = (e, v) => {
      setDirectConnectionEnabled(v);
      window.socket.sendMsg(JSON.stringify({'Setting': {'AP_Enabled' : Number(v)}}))
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
      if (window.socket.readyState == 1) {
        window.socket.sendMsg(JSON.stringify({'listWiFi':1}))
      }
      setLoading(true);
    }
  
    function saveWiFiPassword(){
      if (window.socket.readyState == 1) {
        window.socket.sendMsg(JSON.stringify({'saveWiFi':{SSID:selectedValue, PW:selectedPassword}}))
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
        const portName = portInfo.serialNumber || portIn
        
        fo.deviceName;
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