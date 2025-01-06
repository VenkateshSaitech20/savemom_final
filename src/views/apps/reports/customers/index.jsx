'use client'
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import CustomTabList from '@core/components/mui/TabList';
import PropTypes from 'prop-types';

const UserReportTabs = ({ tabContentList }) => {
    const [activeTab, setActiveTab] = useState('ActiveUsersReport')

    const handleChange = (event, value) => {
        setActiveTab(value)
    }

    return (
        <TabContext value={activeTab}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
                        <Tab label='Active Users' value='ActiveUsersReport' />
                        <Tab label='Inactive Users' value='InactiveUsersReport' />
                        <Tab label='Pending Users' value='PendingUsersReport' />
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

UserReportTabs.propTypes = {
    tabContentList: PropTypes.object,
};

export default UserReportTabs;
