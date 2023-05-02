import styles from './log-box.module.css';

function LogBox({ children, button }) {
  return (
    <div className={styles.container}>
      <div className={styles.parallelogram}>
        { children }
      </div>
      { button }
    </div>
  );
}

export default LogBox;