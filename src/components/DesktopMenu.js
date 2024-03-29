import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// styles
import styles from './DesktopMenu.module.css'

// components
import Logo from './Logo'
import GraphIcon from './icons/GraphIcon'
import ConnectionIcon from './icons/ConnectionIcon'
import UserInfoDesktop from './UserInfoDesktop'
import CallToActionButton from './CallToActionButton'

export default function DesktopMenu({ onClick }) {
  const [summarySelected, setSummarySelected] = useState(false)
  const [transactionsSelected, setTransactionsSelected] = useState(false)
  const router = useRouter()
  const currentPath = router.pathname
  const { year } = router.query

  let defaultColor = '#667085'
  let selectedColor = '#7F56D9'
  let summaryColor
  let transactionsColor

  useEffect(() => {
    if (currentPath.includes('summary')) {
      setSummarySelected(true)
      setTransactionsSelected(false)
    } else {
      setSummarySelected(false)
      setTransactionsSelected(true)
    }
  }, [currentPath])

  if (currentPath.includes('summary')) {
    summaryColor = selectedColor
    transactionsColor = defaultColor
  } else {
    transactionsColor = selectedColor
    summaryColor = defaultColor
  }

  return (
    <>
      <div className={styles.container}>
        <Logo />
        <nav>
          <div
            className={
              summarySelected ? styles.navItemSelected : styles.navItem
            }
          >
            <GraphIcon color={summaryColor} />
            <Link href={`/transactions/summary/${year}`}>Summary</Link>
          </div>
          <div
            className={
              transactionsSelected ? styles.navItemSelected : styles.navItem
            }
          >
            <ConnectionIcon color={transactionsColor} />
            <Link href={`/transactions/year/${year}`}>Transactions</Link>
          </div>
        </nav>
        <div className={styles.rightContainer}>
          {currentPath.includes('summary') ? (
            <div className={styles.empty}></div>
          ) : (
            <CallToActionButton
              title='Add Transaction'
              onClick={onClick}
            />
          )}
          <UserInfoDesktop />
        </div>
      </div>
    </>
  )
}
