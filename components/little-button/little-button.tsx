import styles from './little-button.module.css';

function LittleButton({ mute, onClickAction, isGenerating, children }) {
  return (
    <div className={!mute ? styles.container : `${styles.container} ${styles.mute}`}>
      <button
        type="button"
        className={`${styles.button}`}
        onClick={!mute ? onClickAction : null}
      >
        { children }
      </button>
    </div>
  );
}

export default LittleButton;
