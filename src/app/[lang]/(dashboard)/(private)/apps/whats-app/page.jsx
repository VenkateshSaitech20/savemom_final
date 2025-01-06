import dynamic from 'next/dynamic';
import WhatsAppPage from '@views/pages/whats-app';

const WhatsAppWrapper = dynamic(() => import('@views/apps/whats-app'))
const WhatsAppSetting = dynamic(() => import('@views/apps/whats-app/setting'))
const WhatsAppTemplate = dynamic(() => import('@views/apps/whats-app/template'))

const tabContentList = () => ({
  'channel': <WhatsAppWrapper folder='sent' />,
  'setting': <WhatsAppSetting />,
  'template': <WhatsAppTemplate />
})

const WhatsAppPageAppSetting = () => {
  return <WhatsAppPage tabContentList={tabContentList()} />
}

export default WhatsAppPageAppSetting

