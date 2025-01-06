'use client'
import { useState, useEffect } from 'react';
import HelpCenterHeader from './HelpCenterHeader';
import Articles from './Articles';
import KnowledgeBase from './KnowledgeBase';
import KeepLearning from './KeepLearning';
import NeedHelp from './NeedHelp';
import { useSettings } from '@core/hooks/useSettings';

const HelpCenterWrapper = () => {
  const [searchValue, setSearchValue] = useState('')
  const { updatePageSettings } = useSettings()

  // For Page specific settings
  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='bg-backgroundPaper'>
      <HelpCenterHeader searchValue={searchValue} setSearchValue={setSearchValue} />
      <Articles />
      <KnowledgeBase />
      <KeepLearning />
      <NeedHelp />
    </div>
  )
}

export default HelpCenterWrapper
