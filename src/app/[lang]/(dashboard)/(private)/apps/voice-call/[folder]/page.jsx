import dynamic from 'next/dynamic';
import VoiceCallPage from '@views/pages/voice-call';
import PropTypes from "prop-types";

const VoiceCallWrapper = dynamic(() => import('@views/apps/voice-call'));

const tabContentList = (params) => ({
    'channel': <VoiceCallWrapper folder={params?.folder || 'default-folder'} />
});

const VoiceCallFolderPage = ({ params }) => {
    return <VoiceCallPage tabContentList={tabContentList(params || { folder: 'default-folder' })} />;
}

VoiceCallFolderPage.propTypes = {
    params: PropTypes.any,
};
export default VoiceCallFolderPage;

