import { useState, useEffect } from 'react'
import { useResetPassword } from '@/hooks/useResetPassword'
import Image from 'next/image'
import Head from 'next/head'

// styles
import styles from './ForgotPassword.module.css'

// pages & components
import Logo from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { resetPassword, error, isPending, message } = useResetPassword()

  const handleSubmit = (e) => {
    e.preventDefault()
    resetPassword(email)
    setEmail('')
  }

  // clear the email input field when the error changes
  useEffect(() => {
    return () => {
      setEmail('')
    }
  }, [error])

  // automatically update the footer copyright date
  const currentYear = new Date().getFullYear()

  return (
    <>
      <Head>
        <title>Reset Password | Money Manager Demo App by ZED CHAMAA</title>
        <meta
          name='description'
          content='Reset your money manager demo app account password'
        />
      </Head>
      <div className={styles.pageContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.leftContent}>
            {error && <div className='form-alert'>{error}</div>}
            {!error && message && (
              <div className='form-alert-success'>{message}</div>
            )}
            <div className={styles.logo}>
              <Logo link={'/login'} />
            </div>
            <div className={styles.form}>
              <form
                onSubmit={handleSubmit}
                className={styles.formContainer}
              >
                <div className={styles.topContainer}>
                  <h1>Password Reset</h1>
                  <p>
                    If you're registered, we will email you a link to reset your
                    password. Make sure to also check your spam folder for the
                    email.
                  </p>
                </div>
                <div className={styles.middleContainer}>
                  <div className={styles.labels}>
                    <label>
                      <span>Email</span>
                      <input
                        type='email'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder='example@email.com'
                        required
                      />
                    </label>
                  </div>
                  <div>
                    {!isPending && (
                      <button className={styles.btn}>Reset Password</button>
                    )}
                    {isPending && (
                      <button
                        className={styles.btn}
                        disabled
                      >
                        loading...
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.copyright}>
                  Copyright &copy; {currentYear}
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href='https://zedchamaa.com'
                  >
                    zedchamaa
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.rightContent}>
            <div className={styles.description}>
              Revolutionize the way you manage your money. With our powerful and
              easy-to-use app, you can finally take control of your finances and
              make smarter financial decisions.
            </div>
            <div className={styles.mockup}>
              <Image
                src='/assets/images/mockup.png'
                alt='mockup'
                width='980'
                height='600'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
