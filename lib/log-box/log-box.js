import styles from './log-box.module.css';

function LogBox({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.parallelogram}>
        { children }
      </div>
    </div>
  );
}

export default LogBox;