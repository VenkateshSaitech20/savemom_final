import dynamic from 'next/dynamic'
import MasterDataSettings from '@views/pages/master-data-settings'

const Country = dynamic(() => import('@views/pages/master-data-settings/country'))
const State = dynamic(() => import('@views/pages/master-data-settings/state'))
const City = dynamic(() => import('@views/pages/master-data-settings/city'))
const District = dynamic(() => import('@views/pages/master-data-settings/district'))

// Vars
const tabContentList = () => ({
    'country': <Country />,
    'state': <State />,
    'city': <District />,
    'district': <City />
})

const MasterDataSettingsPage = () => {
    return <MasterDataSettings tabContentList={tabContentList()} />
}

export default MasterDataSettingsPage

