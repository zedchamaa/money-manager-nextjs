import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useFirestore } from '@/hooks/useFirestore'

// styles
import styles from './TransactionsListMobile.module.css'

// components
import IncomeIconMobile from './icons/IncomeIconMobile'
import ExpenseIconMobile from './icons/ExpenseIconMobile'
import EditIconMobile from './icons/EditIconMobile'
import TrashIconMobile from './icons/TrashIconMobile'
import PaginationMenu from './PaginationMenu'
import TransactionsForm from './TransactionsForm'
import Modal from './Modal'

// libraries
import { formatNumber } from 'accounting'

export default function TransactionsListMobile({ filteredTransactions }) {
  let amountSign = ''
  const [alert, setAlert] = useState(false)
  const [deleteAlert, setDeleteAlert] = useState('')
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showTransaction, setShowTransaction] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [transactionCategory, setTransactionCategory] = useState('')

  const { deleteDocument } = useFirestore('transactions')
  const router = useRouter()
  const { year } = router.query

  // pagination menu
  const [showPaginationMenu, setShowPaginationMenu] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const transactionsPerPage = 6
  const pagesVisited = pageNumber * transactionsPerPage
  const pageCount = Math.ceil(
    filteredTransactions?.length / transactionsPerPage
  )

  const changePage = ({ selected }) => {
    setPageNumber(selected)
  }

  // Only show the pagination menu when transactions
  // exceed the transactions per page
  useEffect(() => {
    if (filteredTransactions?.length > transactionsPerPage) {
      setShowPaginationMenu(true)
    } else {
      setShowPaginationMenu(false)
    }
  }, [filteredTransactions])

  useEffect(() => {
    if (filteredTransactions?.length === 0) {
      setAlert(true)
    } else setAlert(false)
  }, [filteredTransactions])

  const handleEditTransaction = (transaction) => {
    setShowModal(true)
    setTransactionId(transaction.id)
    setTransactionDate(transaction.date)
    setTransactionAmount(transaction.amount)
    setTransactionType(transaction.type)
    setTransactionCategory(transaction.category)
  }

  // hide the modal
  const handleCancel = () => {
    setShowModal(false)
  }

  // show or hide the delete transaction alert
  const handleDeleteAlert = (transaction) => {
    setShowTransaction(false)
    setSelectedTransaction(transaction)
    setDeleteAlert('Permanently delete?')
    setShowDeleteAlert(true)
  }

  // cancel the delete transaction alert
  const handleCancelAlert = () => {
    setShowDeleteAlert(false)
    setShowTransaction(true)
  }

  // delete the transaction on confirmation
  const handleDeleteTransaction = (transaction) => {
    deleteDocument(transaction.id)
    setShowDeleteAlert(false)
    setShowTransaction(true)
  }

  const transactions = filteredTransactions
    ?.sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(pagesVisited, pagesVisited + transactionsPerPage)
    .map((transaction) => (
      <div
        className={showTransaction ? styles.container : styles.emptyContainer}
        key={transaction.id}
      >
        {showDeleteAlert && selectedTransaction === transaction && (
          <div className={styles.warningContainer}>
            <div>{deleteAlert}</div>
            <div className={styles.buttons}>
              <button onClick={() => handleDeleteTransaction(transaction)}>
                Yes
              </button>
              <button onClick={handleCancelAlert}>No</button>
            </div>
          </div>
        )}
        {showTransaction && (
          <>
            <div className={styles.boxOne}>
              <div>
                {transaction.type === 'income' ? (
                  <IncomeIconMobile />
                ) : (
                  <ExpenseIconMobile />
                )}
              </div>
              <div className={styles.info}>
                <div className={styles.category}>{transaction.category}</div>
                <div className={styles.date}>{transaction.date}</div>
              </div>
            </div>
            <div className={styles.boxTwo}>
              <div className={styles.icons}>
                <EditIconMobile
                  onClick={() => handleEditTransaction(transaction)}
                />
                <TrashIconMobile
                  onClick={() => handleDeleteAlert(transaction)}
                />
              </div>
              <div
                className={
                  transaction.type === 'income'
                    ? styles.incomeAmount
                    : styles.expenseAmount
                }
              >
                {transaction.type === 'income'
                  ? (amountSign = '+')
                  : (amountSign = '-')}
                ${formatNumber(transaction.amount)}
              </div>
            </div>
          </>
        )}
      </div>
    ))

  return (
    <>
      {showModal && (
        <Modal title='Edit Transaction'>
          <TransactionsForm
            handleCancel={handleCancel}
            title='Edit Transaction'
            transactionId={transactionId}
            transactionDate={transactionDate}
            transactionAmount={transactionAmount}
            transactionType={transactionType}
            transactionCategory={transactionCategory}
          />
        </Modal>
      )}
      {alert && (
        <p>
          There are no transactions currently for <strong>Year {year}</strong>
        </p>
      )}
      {!transactions && <p>Loading...</p>}
      {transactions}
      {showPaginationMenu && (
        <div className={styles.paginationContainer}>
          <PaginationMenu
            pageCount={pageCount}
            changePage={changePage}
          />
        </div>
      )}
    </>
  )
}
