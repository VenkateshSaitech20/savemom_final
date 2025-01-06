// Component Imports
// import EmailWrapper from '@views/apps/email'

// const EmailPage = () => {
//   return <EmailWrapper folder='inbox' />
// }

// export default EmailPage

import dynamic from 'next/dynamic';
import EmailPage from '@views/pages/email';

const EmailWrapper = dynamic(() => import('@views/apps/email'))
const EmailSetting = dynamic(() => import('@views/apps/email/setting'))
const EmailTemplate = dynamic(() => import('@views/apps/email/template'))

const tabContentList = () => ({
  'channel': <EmailWrapper folder='sent' />,
  'setting': <EmailSetting />,
  'template': <EmailTemplate />
})

const EmailPageSetting = () => {
  return <EmailPage tabContentList={tabContentList()} />
}

export default EmailPageSetting

