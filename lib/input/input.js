import styles from './input.module.css';

function Input({ placeholder, value, onChangeAction, children }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value} 
      onChange={onChangeAction}
      className={styles.input}
    >
      { children }
    </input>
  );
}

export default Input;
