import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Your Blank dApp</h1>
        <p className={styles.subtitle}>Start building your amazing project here!</p>
      </div>
    </div>
  )
}
