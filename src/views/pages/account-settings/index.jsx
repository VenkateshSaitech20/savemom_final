'use client'
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import CustomTabList from '@core/components/mui/TabList';
import PropTypes from "prop-types";

const AccountSettings = ({ tabContentList }) => {
  const [activeTab, setActiveTab] = useState('account')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab label='Account' icon={<i className='bx-user' />} iconPosition='start' value='account' />
            <Tab label='Security' icon={<i className='bx-lock-alt' />} iconPosition='start' value='security' />
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

AccountSettings.propTypes = {
  tabContentList: PropTypes.any,
};
export default AccountSettings
