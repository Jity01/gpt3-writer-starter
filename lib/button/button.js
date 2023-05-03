/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import styles from './button.module.css';

function Button({ onClickAction, isGenerating, style, children }) {
  return (
    <div className={styles.container} style={style}>
      <button
        type="button"
        className={isGenerating ? `${styles.button} ${styles.loading}` : styles.button}
        onClick={onClickAction}
      >
        { isGenerating ? <span className={styles.loader} /> : children }
      </button>
    </div>
  );
}

Button.propTypes = {
  onClickAction: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default Button;
