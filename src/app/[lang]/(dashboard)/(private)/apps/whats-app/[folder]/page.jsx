import dynamic from 'next/dynamic';
import WhatsAppPage from '@views/pages/whats-app';
import PropTypes from "prop-types";

const WhatsAppWrapper = dynamic(() => import('@views/apps/whats-app'));

const tabContentList = (params) => ({
    'channel': <WhatsAppWrapper folder={params?.folder || 'default-folder'} />
});

const WhatsAppFolderPage = ({ params }) => {
    return <WhatsAppPage tabContentList={tabContentList(params || { folder: 'default-folder' })} />;
}

WhatsAppFolderPage.propTypes = {
    params: PropTypes.any,
};
export default WhatsAppFolderPage;

