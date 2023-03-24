import { useRouter } from 'next/router'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useState } from 'react'
import { useCollection } from '@/hooks/useCollection'

// styles
import styles from './summary.module.css'

// components
import MobileMenu from '@/components/MobileMenu'
import DesktopMenu from '@/components/DesktopMenu'
import IntroTopMobile from '@/components/IntroTopMobile'
import Modal from '@/components/Modal'
import TransactionsForm from '@/components/TransactionsForm'
import YearsCarouselMobile from '@/components/YearsCarouselMobile'
import YearsCarouselDesktop from '@/components/YearsCarouselDesktop'
import PieChart from '@/components/PieChart'

export default function TransactionsSummary() {
  let transactionsByYear
  let totalIncome
  let totalExpenses
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const { year } = router.query
  const { user } = useAuthContext()

  const { documents } = useCollection(
    'transactions',
    user,
    user && ['uid', '==', user.uid],
    ['createdAt', 'desc']
  )

  // hide the page content from non-logged in users
  // always run this if statement first
  if (!user) {
    return
  }

  if (documents) {
    // filter the transactions based on the page's year
    transactionsByYear = documents.filter((doc) => doc.date.includes(year))

    // find the total amount of income transactions
    const incomeTransactions = transactionsByYear.filter(
      (transaction) => transaction.type === 'income'
    )

    totalIncome = incomeTransactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    )

    // find the total amount of expenses transactions
    const expensesTransactions = transactionsByYear.filter(
      (transaction) => transaction.type === 'expense'
    )

    totalExpenses = expensesTransactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    )
  }
  // pie chart data for current year
  const currentYearData = {
    datasets: [
      {
        data: [totalIncome, totalExpenses],
        backgroundColor: ['#7F56D9', '#E9D7FE'],
        hoverOffset: 4,
      },
    ],
  }

  // show the modal
  const handleShowModal = () => {
    setShowModal(true)
  }

  // hide the modal
  const handleCancel = () => {
    setShowModal(false)
  }

  return (
    <>
      {showModal && (
        <Modal title='Add Transaction'>
          <TransactionsForm handleCancel={handleCancel} />
        </Modal>
      )}
      <MobileMenu />
      <DesktopMenu onClick={handleShowModal} />
      <IntroTopMobile
        title='Summary'
        onClick={handleShowModal}
      />
      <YearsCarouselMobile />
      <YearsCarouselDesktop />
      <div className={styles.pieCharts}>
        <PieChart
          title='Year 2023'
          chartData={currentYearData}
          labelOne='Income'
          labelTwo='Expenses'
          income={totalIncome}
          expenses={totalExpenses}
          remaining={totalIncome - totalExpenses}
          budget={0}
        />
        <PieChart
          title='Monthly Average'
          chartData={currentYearData}
          labelOne='Income'
          labelTwo='Expenses'
        />
      </div>
    </>
  )
}
