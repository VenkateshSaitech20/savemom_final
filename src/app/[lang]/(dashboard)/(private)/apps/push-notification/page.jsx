import dynamic from 'next/dynamic';
import PushNotificationPage from '@views/pages/push-notification';

const PushNotificationWrapper = dynamic(() => import('@views/apps/push-notification'))
const PushNotificationSetting = dynamic(() => import('@views/apps/push-notification/setting'))
const PushNotificationTemplate = dynamic(() => import('@views/apps/push-notification/template'))

const tabContentList = () => ({
  'channel': <PushNotificationWrapper folder='sent' />,
  'setting': <PushNotificationSetting />,
  'template': <PushNotificationTemplate />
})

const SMSPageAppSetting = () => {
  return <PushNotificationPage tabContentList={tabContentList()} />
}

export default SMSPageAppSetting

