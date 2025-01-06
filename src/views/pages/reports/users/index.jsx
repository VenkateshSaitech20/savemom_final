import dynamic from 'next/dynamic'
import UserReportTabs from '@views/apps/reports/customers'

import { getEcommerceData } from '@/app/server/actions'

const ActiveUsersReport = dynamic(() => import('@views/apps/reports/customers/list/ActiveUsersReport'))
const InactiveUsersReport = dynamic(() => import('@views/apps/reports/customers/list/InactiveUsersReport'))
const PendingUsersReport = dynamic(() => import('@views/apps/reports/customers/list/PendingUsersReport'))

const data = await getEcommerceData()

const tabContentList = () => ({
    'ActiveUsersReport': <ActiveUsersReport customerData={data?.customerData} />,
    'InactiveUsersReport': <InactiveUsersReport customerData={data?.customerData} />,
    'PendingUsersReport': <PendingUsersReport customerData={data?.customerData} />
})

const UserReport = () => {
    return <UserReportTabs tabContentList={tabContentList()} />
}

export default UserReport
