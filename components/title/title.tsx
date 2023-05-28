import PropTypes from 'prop-types';
import styles from './title.module.css';

function Title({ title, onClickAction }) {
  return (
    <div className={styles.container}>
      <button onClick={onClickAction} className={styles.btn}></button>
    </div>
  );
}

Title.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default Title;
