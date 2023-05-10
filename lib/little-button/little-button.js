import styles from './little-button.module.css';

function LittleButton({ onClickAction, children }) {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.button}`}
        onClick={onClickAction}
      >
        { children }
      </button>
    </div>
  );
}

export default LittleButton;
