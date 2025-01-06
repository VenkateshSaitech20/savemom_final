'use client'
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import CustomTabList from '@core/components/mui/TabList';
import PropTypes from 'prop-types';
const WebsiteSettings = ({ tabContentList }) => {
    const [activeTab, setActiveTab] = useState('first-section')
    const handleChange = (event, value) => {
        setActiveTab(value)
    }
    return (
        <TabContext value={activeTab}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
                        <Tab label='Hero Section' value='first-section' />
                        <Tab label='Features' value='second-section' />
                        <Tab label='Testimonial' value='testimonial' />
                        <Tab label='Brand' value='brand' />
                        <Tab label='Our Team' value='our-team' />
                        <Tab label='Plans' value='plan' />
                        <Tab label='Key Achievements' value='key-achievements' />
                        <Tab label='Faqs' value='faqs' />
                        <Tab label='Contact Us' value='contact-us' />
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
WebsiteSettings.propTypes = {
    tabContentList: PropTypes.object,
};
export default WebsiteSettings;
