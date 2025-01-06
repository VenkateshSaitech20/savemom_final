// Component Imports
// import EmailWrapper from '@views/apps/email'
// const EmailFolderPage = ({ params }) => {
//   return <EmailWrapper folder={params.folder} />
// }
// export default EmailFolderPage


import dynamic from 'next/dynamic';
import EmailPage from '@views/pages/email';

const EmailWrapper = dynamic(() => import('@views/apps/email'));

const tabContentList = (params) => ({
    'channel': <EmailWrapper folder={params?.folder || 'default-folder'} />
});

const EmailFolderPage = ({ params }) => {
    return <EmailPage tabContentList={tabContentList(params || { folder: 'default-folder' })} />;
}

export default EmailFolderPage;

