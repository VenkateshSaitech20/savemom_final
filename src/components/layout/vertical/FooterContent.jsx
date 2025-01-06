'use client'
import classnames from 'classnames'
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-center flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, `}</span>
        <span className='text-primary'>Savemom</span>
      </p>
    </div>
  )
}

export default FooterContent
