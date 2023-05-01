import styles from './generate-button.module.css';

function GenerateButton({ onClickAction, isGenerating }) {
  return (
    <div className={styles.promptButtons}>
      <a
        className={isGenerating ? `${styles.generateButton} ${styles.loading}` : styles.generateButton}
        onClick={onClickAction}
      >
        <div>
            { isGenerating ? <span className={styles.loader} /> : <p>JENerate</p> }
        </div>
      </a>
    </div>
  )
}

export default GenerateButton;
