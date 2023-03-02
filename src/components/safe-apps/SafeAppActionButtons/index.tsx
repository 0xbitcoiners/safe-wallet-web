import { useRouter } from 'next/router'
import { resolveHref } from 'next/dist/shared/lib/router/router'
import type { UrlObject } from 'url'
import type { ChainInfo, SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { NextRouter } from 'next/router'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import SvgIcon from '@mui/material/SvgIcon'

import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
import { useCurrentChain } from '@/hooks/useChains'
import CopyButton from '@/components/common/CopyButton'
import ShareIcon from '@/public/images/common/share.svg'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'
import BookmarkedIcon from '@/public/images/apps/bookmarked.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import InfoIcon from '@/public/images/notifications/info.svg'

type SafeAppActionButtonsProps = {
  safeApp: SafeAppData
  isBookmarked?: boolean
  onBookmarkSafeApp?: (safeAppId: number) => void
  removeCustomApp?: (safeApp: SafeAppData) => void
  openPreviewDrawer?: (safeApp: SafeAppData) => void
}

const SafeAppActionButtons = ({
  safeApp,
  isBookmarked,
  onBookmarkSafeApp,
  removeCustomApp,
  openPreviewDrawer,
}: SafeAppActionButtonsProps) => {
  const router = useRouter()
  const currentChain = useCurrentChain()

  const isCustomApp = safeApp.id < 1
  const shareSafeAppUrl = getShareSafeAppUrl(router, safeApp.url, currentChain)

  const handleCopyShareSafeAppUrl = () => {
    const appName = isCustomApp ? safeApp.url : safeApp.name
    trackSafeAppEvent(SAFE_APPS_EVENTS.COPY_SHARE_URL, appName)
  }

  return (
    <Box display="flex" gap={1}>
      {/* Open the preview drawer */}
      {openPreviewDrawer && (
        <IconButton
          size="small"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            openPreviewDrawer(safeApp)
          }}
        >
          <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
        </IconButton>
      )}

      {/* Copy share Safe App url button */}
      <CopyButton
        initialToolTipText={`Copy share URL for ${safeApp.name}`}
        onCopy={handleCopyShareSafeAppUrl}
        text={shareSafeAppUrl}
      >
        <SvgIcon component={ShareIcon} inheritViewBox color="border" fontSize="small" />
      </CopyButton>

      {/* Bookmark Safe App button */}
      {onBookmarkSafeApp && (
        <Tooltip title={`${isBookmarked ? 'Unpin' : 'Pin'} ${safeApp.name}`} placement="top">
          <IconButton
            size="small"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onBookmarkSafeApp(safeApp.id)
            }}
          >
            <SvgIcon
              component={isBookmarked ? BookmarkedIcon : BookmarkIcon}
              inheritViewBox
              color={isBookmarked ? 'primary' : undefined}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>
      )}

      {/* Remove Custom Safe App button */}
      {removeCustomApp && (
        <Tooltip title={`Delete ${safeApp.name}`} placement="top">
          <IconButton
            size="small"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              removeCustomApp(safeApp)
            }}
          >
            <SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

export default SafeAppActionButtons

export const getShareSafeAppUrl = (router: NextRouter, appUrl: string, currentChain?: ChainInfo) => {
  const shareUrlObj: UrlObject = {
    protocol: typeof window !== 'undefined' ? window.location.protocol : '',
    host: typeof window !== 'undefined' ? window.location.host : '',
    pathname: AppRoutes.share.safeApp,
    query: { appUrl, chain: currentChain?.shortName },
  }

  return resolveHref(router, shareUrlObj)
}
