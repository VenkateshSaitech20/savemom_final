import dynamic from 'next/dynamic';
import SMSPage from '@views/pages/sms';
import PropTypes from "prop-types";

const SMSWrapper = dynamic(() => import('@views/apps/sms'));

const tabContentList = (params) => ({
    'channel': <SMSWrapper folder={params?.folder || 'default-folder'} />
});

const SmsFolderPage = ({ params }) => {
    return <SMSPage tabContentList={tabContentList(params || { folder: 'default-folder' })} />;
}

SmsFolderPage.propTypes = {
    params: PropTypes.any,
};
export default SmsFolderPage;

