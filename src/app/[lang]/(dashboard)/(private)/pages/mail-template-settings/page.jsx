import dynamic from 'next/dynamic'
import MailTemplateSettings from '@/views/pages/mail-template-settings'

const WelcomeMailTemplate = dynamic(() => import('@/views/pages/mail-template-settings/welcome-mail-template'))
const ForgotPasswordMailTemplate = dynamic(() => import('@/views/pages/mail-template-settings/forgot-password-mail-template'))

const tabContentList = () => ({
    'welcome-mail-template': <WelcomeMailTemplate />,
    'forgot-password-mail-template': <ForgotPasswordMailTemplate />
})

const mailTemplateSettingsPage = () => {
    return <MailTemplateSettings tabContentList={tabContentList()} />
}

export default mailTemplateSettingsPage
