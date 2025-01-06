'use client'
import Grid from '@mui/material/Grid';
import PushNotificationTemplateTable from './PushNotificationTemplateTable';
import SubUserPermission from '@/utils/SubUserPermission';

const SMSTemplate = () => {
    const { pushNotificationPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <PushNotificationTemplateTable pushNotificationPermission={pushNotificationPermission} />
            </Grid>
        </Grid>
    )
}

export default SMSTemplate
