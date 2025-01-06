import dynamic from 'next/dynamic';
import VoiceCallPage from '@views/pages/voice-call';

const VoiceCallWrapper = dynamic(() => import('@views/apps/voice-call'))
const VoiceCallSetting = dynamic(() => import('@views/apps/voice-call/setting'))
const VoiceCallTemplate = dynamic(() => import('@views/apps/voice-call/template'))

const tabContentList = () => ({
  'channel': <VoiceCallWrapper folder='sent' />,
  'setting': <VoiceCallSetting />,
  'template': <VoiceCallTemplate />
})

const VoiceCallAppSeting = () => {
  return <VoiceCallPage tabContentList={tabContentList()} />
}

export default VoiceCallAppSeting
