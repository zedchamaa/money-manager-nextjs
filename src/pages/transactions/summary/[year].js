import { useRouter } from 'next/router'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useState } from 'react'
import { useCollection } from '@/hooks/useCollection'
import Head from 'next/head'

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
import BarChart from '@/components/BarChart'
import QuarterAverage from '@/components/QuarterAverage'
import MonthlyDetailMobileDivider from '@/components/icons/MonthlyDetailMobileDivider'
import MonthlyDetailMobile from '@/components/MonthlyDetailMobile'
import MonthlyDetailDesktop from '@/components/MonthlyDetailDesktop'
import IncomeIconSmall from '@/components/icons/IncomeIconSmall'
import ExpensesIconSmall from '@/components/icons/ExpensesIconSmall'
import RemainingIconSmall from '@/components/icons/RemainingIconSmall'
import BudgetIconSmall from '@/components/icons/BudgetIconSmall'
import Footer from '@/components/Footer'

export default function TransactionsSummary() {
  let transactionsByYear
  let totalIncome
  let totalExpenses
  let totalMonthlyAvgIncome
  let totalMonthlyAvgExpenses
  let yearBudget
  let avgBudgetQ1
  let avgBudgetQ2
  let avgBudgetQ3
  let avgBudgetQ4
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

  const { documents: budgets } = useCollection(
    'budgets',
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

    totalMonthlyAvgIncome = Math.round(totalIncome / 12)

    // find the total amount of expenses transactions
    const expensesTransactions = transactionsByYear.filter(
      (transaction) => transaction.type === 'expense'
    )

    totalExpenses = expensesTransactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    )

    totalMonthlyAvgExpenses = Math.round(totalExpenses / 12)
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

  // pie chart data for current year monthly average
  const currentYearMonthlyAvgData = {
    datasets: [
      {
        data: [totalMonthlyAvgIncome, totalMonthlyAvgExpenses],
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

  // find the total income of a given month
  function getMonthlyIncome(documents, month) {
    if (documents && transactionsByYear) {
      return transactionsByYear
        .filter(
          (transaction) =>
            transaction.type === 'income' && transaction.date.includes(month)
        )
        .reduce((acc, transaction) => acc + transaction.amount, 0)
    }
  }

  // find the total expense of a given month
  function getMonthlyExpense(documents, month) {
    if (documents && transactionsByYear) {
      return transactionsByYear
        .filter(
          (transaction) =>
            transaction.type === 'expense' && transaction.date.includes(month)
        )
        .reduce((acc, transaction) => acc + transaction.amount, 0)
    }
  }

  // calculate the average income of a given quarter
  function getAvgQuarterIncome(
    incomeMonthOne,
    incomeMonthTwo,
    incomeMonthThree
  ) {
    return (
      parseInt(incomeMonthOne + incomeMonthTwo + incomeMonthThree) / 3
    ).toFixed(2)
  }

  // calculate the average expenses of a given quarter
  function getAvgQuarterExpenses(
    expensesMonthOne,
    expensesMonthTwo,
    expensesMonthThree
  ) {
    return (
      parseInt(expensesMonthOne + expensesMonthTwo + expensesMonthThree) / 3
    ).toFixed(2)
  }

  // calculate the quarterly average remaining value
  function getAvgQuarterRemaining(income, expenses) {
    return income - expenses
  }

  // calculate the total budget amount of current year
  if (budgets) {
    yearBudget = budgets
      .filter((budget) => budget.year === year)
      .reduce((acc, budget) => acc + budget.amount, 0)
  }

  // calculate the average budget of each quarter
  function getAvgQuarterBudget(monthOne, monthTwo, monthThree) {
    if (budgets) {
      const avgQuarterBudget =
        budgets
          .filter(
            (budget) =>
              budget.year === year &&
              (budget.month === monthOne ||
                budget.month === monthTwo ||
                budget.month === monthThree)
          )
          .reduce((acc, budget) => acc + budget.amount, 0) / 3

      return avgQuarterBudget
    }
  }

  // calculate the average budget of Q1
  avgBudgetQ1 = getAvgQuarterBudget('January', 'February', 'March')

  // calculate the average budget of Q2
  avgBudgetQ2 = getAvgQuarterBudget('April', 'May', 'June')

  // calculate the average budget of Q3
  avgBudgetQ3 = getAvgQuarterBudget('July', 'August', 'September')

  // calculate the average budget of Q4
  avgBudgetQ4 = getAvgQuarterBudget('October', 'November', 'December')

  // find the income of each month
  const janIncome = getMonthlyIncome(documents, 'Jan')
  const febIncome = getMonthlyIncome(documents, 'Feb')
  const marIncome = getMonthlyIncome(documents, 'Mar')
  const aprIncome = getMonthlyIncome(documents, 'Apr')
  const mayIncome = getMonthlyIncome(documents, 'May')
  const junIncome = getMonthlyIncome(documents, 'Jun')
  const julIncome = getMonthlyIncome(documents, 'Jul')
  const augIncome = getMonthlyIncome(documents, 'Aug')
  const sepIncome = getMonthlyIncome(documents, 'Sep')
  const octIncome = getMonthlyIncome(documents, 'Oct')
  const novIncome = getMonthlyIncome(documents, 'Nov')
  const decIncome = getMonthlyIncome(documents, 'Dec')

  // find the expenses of each month
  const janExpenses = getMonthlyExpense(documents, 'Jan')
  const febExpenses = getMonthlyExpense(documents, 'Feb')
  const marExpenses = getMonthlyExpense(documents, 'Mar')
  const aprExpenses = getMonthlyExpense(documents, 'Apr')
  const mayExpenses = getMonthlyExpense(documents, 'May')
  const junExpenses = getMonthlyExpense(documents, 'Jun')
  const julExpenses = getMonthlyExpense(documents, 'Jul')
  const augExpenses = getMonthlyExpense(documents, 'Aug')
  const sepExpenses = getMonthlyExpense(documents, 'Sep')
  const octExpenses = getMonthlyExpense(documents, 'Oct')
  const novExpenses = getMonthlyExpense(documents, 'Nov')
  const decExpenses = getMonthlyExpense(documents, 'Dec')

  // calculate the income quarterly averages
  const avgIncomeQ1 = getAvgQuarterIncome(janIncome, febIncome, marIncome)
  const avgIncomeQ2 = getAvgQuarterIncome(aprIncome, mayIncome, junIncome)
  const avgIncomeQ3 = getAvgQuarterIncome(julIncome, augIncome, sepIncome)
  const avgIncomeQ4 = getAvgQuarterIncome(octIncome, novIncome, decIncome)

  // calculate the expenses quarterly averages
  const avgExpensesQ1 = getAvgQuarterExpenses(
    janExpenses,
    febExpenses,
    marExpenses
  )
  const avgExpensesQ2 = getAvgQuarterExpenses(
    aprExpenses,
    mayExpenses,
    junExpenses
  )
  const avgExpensesQ3 = getAvgQuarterExpenses(
    julExpenses,
    augExpenses,
    sepExpenses
  )
  const avgExpensesQ4 = getAvgQuarterExpenses(
    octExpenses,
    novExpenses,
    decExpenses
  )

  // calculate the remaining average of each quarter
  const avgRemainingQ1 = getAvgQuarterRemaining(avgIncomeQ1, avgExpensesQ1)
  const avgRemainingQ2 = getAvgQuarterRemaining(avgIncomeQ2, avgExpensesQ2)
  const avgRemainingQ3 = getAvgQuarterRemaining(avgIncomeQ3, avgExpensesQ3)
  const avgRemainingQ4 = getAvgQuarterRemaining(avgIncomeQ4, avgExpensesQ4)

  // bar chart data for current year
  const currentYearBarChartData = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        // monthly income
        data: [
          janIncome,
          febIncome,
          marIncome,
          aprIncome,
          mayIncome,
          junIncome,
          julIncome,
          augIncome,
          sepIncome,
          octIncome,
          novIncome,
          decIncome,
        ],
        backgroundColor: ['#7F56D9'],
        hoverOffset: 4,
      },
      {
        // monthly expenses
        data: [
          janExpenses,
          febExpenses,
          marExpenses,
          aprExpenses,
          mayExpenses,
          junExpenses,
          julExpenses,
          augExpenses,
          sepExpenses,
          octExpenses,
          novExpenses,
          decExpenses,
        ],
        backgroundColor: ['#E9D7FE'],
        hoverOffset: 4,
      },
    ],
  }

  return (
    <>
      <Head>
        <title>
          Transactions Summary | Money Manager Demo App by ZED CHAMAA
        </title>
        <meta
          name='description'
          content='View your transactions summary and get a quick overview of your finances.'
        />
      </Head>
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
          title={`Year ${year}`}
          chartData={currentYearData}
          labelOne='Income'
          labelTwo='Expenses'
          income={totalIncome}
          expenses={totalExpenses}
          remaining={totalIncome - totalExpenses}
          budget={yearBudget}
        />
        <PieChart
          title='Monthly Average'
          chartData={currentYearMonthlyAvgData}
          labelOne='Income'
          labelTwo='Expenses'
          income={totalMonthlyAvgIncome}
          expenses={totalMonthlyAvgExpenses}
          remaining={totalMonthlyAvgIncome - totalMonthlyAvgExpenses}
          budget={yearBudget / 12}
        />
      </div>
      <div className={styles.averagesContainer}>
        <QuarterAverage
          title='Q1 Average'
          income={avgIncomeQ1}
          expenses={avgExpensesQ1}
          remaining={avgRemainingQ1}
          budget={avgBudgetQ1}
        />
        <QuarterAverage
          title='Q2 Average'
          income={avgIncomeQ2}
          expenses={avgExpensesQ2}
          remaining={avgRemainingQ2}
          budget={avgBudgetQ2}
        />
        <QuarterAverage
          title='Q3 Average'
          income={avgIncomeQ3}
          expenses={avgExpensesQ3}
          remaining={avgRemainingQ3}
          budget={avgBudgetQ3}
        />
        <QuarterAverage
          title='Q4 Average'
          income={avgIncomeQ4}
          expenses={avgExpensesQ4}
          remaining={avgRemainingQ4}
          budget={avgBudgetQ4}
        />
      </div>
      <div className={styles.barChart}>
        <BarChart
          title='Monthly Summary'
          chartData={currentYearBarChartData}
          labelOne='Income'
          labelTwo='Expenses'
        />
      </div>
      <div className={styles.monthlyDetailMobile}>
        <div className={styles.title}>Monthly Detail</div>
        <div className={styles.divider}>
          <MonthlyDetailMobileDivider />
        </div>
        <MonthlyDetailMobile
          month='January'
          income={janIncome}
          expenses={janExpenses}
          remaining={janIncome - janExpenses}
        />
        <MonthlyDetailMobile
          month='February'
          income={febIncome}
          expenses={febExpenses}
          remaining={febIncome - febExpenses}
        />
        <MonthlyDetailMobile
          month='March'
          income={marIncome}
          expenses={marExpenses}
          remaining={marIncome - marExpenses}
        />
        <MonthlyDetailMobile
          month='April'
          income={aprIncome}
          expenses={aprExpenses}
          remaining={aprIncome - aprExpenses}
        />
        <MonthlyDetailMobile
          month='May'
          income={mayIncome}
          expenses={mayExpenses}
          remaining={mayIncome - mayExpenses}
        />
        <MonthlyDetailMobile
          month='June'
          income={junIncome}
          expenses={junExpenses}
          remaining={junIncome - junExpenses}
        />
        <MonthlyDetailMobile
          month='July'
          income={julIncome}
          expenses={julExpenses}
          remaining={julIncome - julExpenses}
        />
        <MonthlyDetailMobile
          month='August'
          income={augIncome}
          expenses={augExpenses}
          remaining={augIncome - augExpenses}
        />
        <MonthlyDetailMobile
          month='September'
          income={sepIncome}
          expenses={sepExpenses}
          remaining={sepIncome - sepExpenses}
        />
        <MonthlyDetailMobile
          month='October'
          income={octIncome}
          expenses={octExpenses}
          remaining={octIncome - octExpenses}
        />
        <MonthlyDetailMobile
          month='November'
          income={novIncome}
          expenses={novExpenses}
          remaining={novIncome - novExpenses}
        />
        <MonthlyDetailMobile
          month='December'
          income={decIncome}
          expenses={decExpenses}
          remaining={decIncome - decExpenses}
        />
      </div>
      <div className={styles.monthlyDetailDesktop}>
        <div className={styles.titles}>
          <div className={styles.month}>Month</div>
          <div className={styles.income}>
            <IncomeIconSmall />
            Income
          </div>
          <div className={styles.expenses}>
            <ExpensesIconSmall />
            Expenses
          </div>
          <div className={styles.remaining}>
            <RemainingIconSmall />
            Remaining
          </div>
          <div className={styles.budget}>
            <BudgetIconSmall />
            Budget
          </div>
          <div className={styles.status}>Status</div>
        </div>
        <MonthlyDetailDesktop
          month='January'
          income={janIncome}
          expenses={janExpenses}
          remaining={janIncome - janExpenses}
        />
        <MonthlyDetailDesktop
          month='February'
          income={febIncome}
          expenses={febExpenses}
          remaining={febIncome - febExpenses}
        />
        <MonthlyDetailDesktop
          month='March'
          income={marIncome}
          expenses={marExpenses}
          remaining={marIncome - marExpenses}
        />
        <MonthlyDetailDesktop
          month='April'
          income={aprIncome}
          expenses={aprExpenses}
          remaining={aprIncome - aprExpenses}
        />
        <MonthlyDetailDesktop
          month='May'
          income={mayIncome}
          expenses={mayExpenses}
          remaining={mayIncome - mayExpenses}
        />
        <MonthlyDetailDesktop
          month='June'
          income={junIncome}
          expenses={junExpenses}
          remaining={junIncome - junExpenses}
        />
        <MonthlyDetailDesktop
          month='July'
          income={julIncome}
          expenses={julExpenses}
          remaining={julIncome - julExpenses}
        />
        <MonthlyDetailDesktop
          month='August'
          income={augIncome}
          expenses={augExpenses}
          remaining={augIncome - augExpenses}
        />
        <MonthlyDetailDesktop
          month='September'
          income={sepIncome}
          expenses={sepExpenses}
          remaining={sepIncome - sepExpenses}
        />
        <MonthlyDetailDesktop
          month='October'
          income={octIncome}
          expenses={octExpenses}
          remaining={octIncome - octExpenses}
        />
        <MonthlyDetailDesktop
          month='November'
          income={novIncome}
          expenses={novExpenses}
          remaining={novIncome - novExpenses}
        />
        <MonthlyDetailDesktop
          month='December'
          income={decIncome}
          expenses={decExpenses}
          remaining={decIncome - decExpenses}
        />
      </div>
      <Footer />
    </>
  )
}
