'use client'
import { useState } from 'react';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Grid from '@mui/material/Grid';
import CustomTabList from '@core/components/mui/TabList';
import PropTypes from "prop-types";

const UserRight = ({ tabContentList }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='bx-user' />} value='overview' label='Overview' iconPosition='start' />
            <Tab icon={<i className='bx-lock-alt' />} value='security' label='Security' iconPosition='start' />
            <Tab
              icon={<i className='bx-detail' />}
              value='billing-plans'
              label='Billing & Plans'
              iconPosition='start'
            />
            <Tab icon={<i className='bx-bell' />} value='notifications' label='Notifications' iconPosition='start' />
            <Tab icon={<i className='bx-link' />} value='connections' label='Connections' iconPosition='start' />
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

UserRight.propTypes = {
  tabContentList: PropTypes.any,
};
export default UserRight
