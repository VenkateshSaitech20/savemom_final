import dynamic from 'next/dynamic';
import SMSPage from '@views/pages/sms';

const SMSWrapper = dynamic(() => import('@views/apps/sms'))
const SMSSetting = dynamic(() => import('@views/apps/sms/setting'))
const SMSTemplate = dynamic(() => import('@views/apps/sms/template'))

const tabContentList = () => ({
  'channel': <SMSWrapper folder='sent' />,
  'setting': <SMSSetting />,
  'template': <SMSTemplate />
})

const SMSPageAppSetting = () => {
  return <SMSPage tabContentList={tabContentList()} />
}

export default SMSPageAppSetting

