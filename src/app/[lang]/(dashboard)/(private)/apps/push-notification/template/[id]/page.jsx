import Grid from '@mui/material/Grid'
import PushNotificationTemplateDetail from '@views/apps/push-notification/template/PushNotificationTemplateDetail'

const SMSTemplateViewPage = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <PushNotificationTemplateDetail />
            </Grid>
        </Grid>
    )
}

export default SMSTemplateViewPage
