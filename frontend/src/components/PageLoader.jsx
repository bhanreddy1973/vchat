import React from 'react'
import { LoaderIcon } from 'lucide-react'
const PageLoader = () => {
  return (
    <div>
        <div className="flex items-center justify-center h-screen">
      <LoaderIcon className="animate-spin" />
  </div>
    </div>
  )
}

export default PageLoader
