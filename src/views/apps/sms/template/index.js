'use client'
import Grid from '@mui/material/Grid';
import SMSTemplateTable from './SMSTemplateTable';
import SubUserPermission from '@/utils/SubUserPermission';

const SMSTemplate = () => {
    const { smsPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <SMSTemplateTable smsPermission={smsPermission} />
            </Grid>
        </Grid>
    )
}

export default SMSTemplate
