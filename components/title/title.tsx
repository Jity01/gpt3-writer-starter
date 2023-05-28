import PropTypes from 'prop-types';
import styles from './title.module.css';

function Title({ title, onClickAction, isSearching }) {
  return (
    <div className={styles.container}>
      <button onClick={onClickAction} className={isSearching ? `${styles.btn} ${styles.isSearching}` : styles.btn}></button>
    </div>
  );
}

Title.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default Title;
